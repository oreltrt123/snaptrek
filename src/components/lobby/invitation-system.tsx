"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useNotification } from "@/components/ui/notification"

export function InvitationSystem({ lobbyId }: { lobbyId: string }) {
  const [approvedUsers, setApprovedUsers] = useState<any[]>([])
  const [invitedUsers, setInvitedUsers] = useState<string[]>([])
  const [pendingInvites, setPendingInvites] = useState<any[]>([])
  const [acceptedInvites, setAcceptedInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState<{ [key: string]: boolean }>({})
  const supabase = createClientComponentClient()
  const { showNotification, NotificationsContainer } = useNotification()

  // Load approved users from localStorage
  useEffect(() => {
    const storedApprovedUsers = localStorage.getItem("approvedUsers")
    if (storedApprovedUsers) {
      setApprovedUsers(JSON.parse(storedApprovedUsers))
    }

    // Load invited users from localStorage
    const storedInvitedUsers = localStorage.getItem("invitedUsers")
    if (storedInvitedUsers) {
      setInvitedUsers(JSON.parse(storedInvitedUsers))
    }

    fetchInvitations()
  }, [lobbyId])

  // Save invited users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("invitedUsers", JSON.stringify(invitedUsers))
  }, [invitedUsers])

  const fetchInvitations = async () => {
    setLoading(true)

    try {
      // First try the API endpoint
      const response = await fetch(`/api/invitations?lobbyId=${lobbyId}`)

      if (response.ok) {
        const data = await response.json()
        setPendingInvites(data.pendingInvites || [])
        setAcceptedInvites(data.acceptedInvites || [])
      } else {
        // Fallback to direct Supabase query
        const { data: currentUser } = await supabase.auth.getUser()

        if (currentUser?.user?.id) {
          // Fetch invitations sent to current user
          const { data: receivedInvites, error: receivedError } = await supabase
            .from("invitations")
            .select("*, profiles!invitations_sender_id_fkey(username, avatar_url)")
            .eq("receiver_id", currentUser.user.id)
            .eq("lobby_id", lobbyId)

          if (receivedError) {
            console.error("Error fetching received invitations:", receivedError)
          } else {
            setPendingInvites(receivedInvites || [])
          }

          // Fetch accepted invitations
          const { data: accepted, error: acceptedError } = await supabase
            .from("invitations")
            .select(
              "*, profiles!invitations_sender_id_fkey(username, avatar_url), profiles!invitations_receiver_id_fkey(username, avatar_url)",
            )
            .eq("lobby_id", lobbyId)
            .eq("status", "accepted")
            .or(`sender_id.eq.${currentUser.user.id},receiver_id.eq.${currentUser.user.id}`)

          if (acceptedError) {
            console.error("Error fetching accepted invitations:", acceptedError)
          } else {
            setAcceptedInvites(accepted || [])
          }
        }
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async (userId: string, username: string) => {
    setInviteLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      // First try the emergency invite endpoint
      const response = await fetch("/api/emergency-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
          lobbyId,
        }),
      })

      if (response.ok) {
        // Add to invited users list
        if (!invitedUsers.includes(userId)) {
          setInvitedUsers([...invitedUsers, userId])
        }

        showNotification({
          title: "Invitation Sent",
          message: `Invitation sent to ${username}`,
          type: "success",
        })

        // Refresh invitations
        fetchInvitations()
      } else {
        throw new Error("Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)

      // Try fallback - direct API call
      try {
        const response = await fetch("/api/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId: userId,
            lobbyId,
          }),
        })

        if (response.ok) {
          // Add to invited users list
          if (!invitedUsers.includes(userId)) {
            setInvitedUsers([...invitedUsers, userId])
          }

          showNotification({
            title: "Invitation Sent",
            message: `Invitation sent to ${username}`,
            type: "success",
          })

          // Refresh invitations
          fetchInvitations()
        } else {
          throw new Error("Failed to send invitation via fallback")
        }
      } catch (e) {
        console.error("Fallback invitation error:", e)
        showNotification({
          title: "Error",
          message: "Failed to send invitation. Please try again.",
          type: "error",
        })
      }
    } finally {
      setInviteLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const acceptInvitation = async (invitationId: string, senderId: string) => {
    setInviteLoading((prev) => ({ ...prev, [invitationId]: true }))

    try {
      const response = await fetch("/api/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
        }),
      })

      if (response.ok) {
        showNotification({
          title: "Invitation Accepted",
          message: "You've joined the lobby!",
          type: "success",
        })

        // Refresh invitations
        fetchInvitations()
      } else {
        // Fallback - direct Supabase update
        const { error } = await supabase.from("invitations").update({ status: "accepted" }).eq("id", invitationId)

        if (error) {
          throw error
        }

        showNotification({
          title: "Invitation Accepted",
          message: "You've joined the lobby!",
          type: "success",
        })

        // Refresh invitations
        fetchInvitations()
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      showNotification({
        title: "Error",
        message: "Failed to accept invitation. Please try again.",
        type: "error",
      })
    } finally {
      setInviteLoading((prev) => ({ ...prev, [invitationId]: false }))
    }
  }

  // Filter out users who have already been invited
  const availableUsers = approvedUsers.filter(
    (user) =>
      !invitedUsers.includes(user.id) &&
      !acceptedInvites.some((invite) => invite.sender_id === user.id || invite.receiver_id === user.id),
  )

  return (
    <div className="space-y-6">
      <NotificationsContainer />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Lobby Invitations</h2>
          <Button variant="outline" size="sm" onClick={fetchInvitations} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {/* Available users to invite */}
        <div className="space-y-2">
          <h3 className="font-medium">Available to Invite</h3>
          {availableUsers.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {availableUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span>{user.username}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendInvitation(user.id, user.username)}
                    disabled={inviteLoading[user.id]}
                  >
                    {inviteLoading[user.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-muted rounded-lg">No users available to invite</div>
          )}
        </div>

        {/* Pending invitations */}
        <div className="space-y-2 mt-4">
          <h3 className="font-medium">Pending Invitations</h3>
          {pendingInvites.length > 0 ? (
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-yellow-500/20"
                >
                  <div className="flex items-center gap-2">
                    {invite.profiles?.avatar_url ? (
                      <img
                        src={invite.profiles.avatar_url || "/placeholder.svg"}
                        alt={invite.profiles.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {invite.profiles?.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span>{invite.profiles?.username}</span>
                      <p className="text-xs text-muted-foreground">wants to join your lobby</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => acceptInvitation(invite.id, invite.sender_id)}
                    disabled={inviteLoading[invite.id]}
                  >
                    {inviteLoading[invite.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-muted rounded-lg">No pending invitations</div>
          )}
        </div>

        {/* Accepted invitations */}
        <div className="space-y-2 mt-4">
          <h3 className="font-medium">Lobby Members</h3>
          {acceptedInvites.length > 0 ? (
            <div className="space-y-2">
              {acceptedInvites.map((invite) => {
                // Determine if current user is sender or receiver
                const { data: currentUser } = supabase.auth.getUser()
                const isSender = invite.sender_id === currentUser?.user?.id
                const otherUser = isSender
                  ? invite.profiles_invitations_receiver_id_fkey
                  : invite.profiles_invitations_sender_id_fkey

                return (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-center gap-2">
                      {otherUser?.avatar_url ? (
                        <img
                          src={otherUser.avatar_url || "/placeholder.svg"}
                          alt={otherUser.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {otherUser?.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span>{otherUser?.username}</span>
                        <p className="text-xs text-green-500">In Lobby</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 bg-muted rounded-lg">No members in lobby yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
