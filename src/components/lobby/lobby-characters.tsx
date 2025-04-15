"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { useNotification } from "@/components/ui/notification"

export function LobbyCharacters({ lobbyId }: { lobbyId: string }) {
  const [lobbyMembers, setLobbyMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { showNotification, NotificationsContainer } = useNotification()

  useEffect(() => {
    fetchLobbyMembers()
  }, [lobbyId])

  const fetchLobbyMembers = async () => {
    setLoading(true)

    try {
      // Get current user
      const { data: currentUser } = await supabase.auth.getUser()

      if (!currentUser?.user?.id) {
        throw new Error("Not authenticated")
      }

      // Fetch accepted invitations for this lobby
      const { data: invitations, error: invitationsError } = await supabase
        .from("invitations")
        .select(`
          id, 
          sender_id, 
          receiver_id, 
          profiles!invitations_sender_id_fkey(id, username, avatar_url), 
          profiles!invitations_receiver_id_fkey(id, username, avatar_url)
        `)
        .eq("lobby_id", lobbyId)
        .eq("status", "accepted")
        .or(`sender_id.eq.${currentUser.user.id},receiver_id.eq.${currentUser.user.id}`)

      if (invitationsError) {
        console.error("Error fetching lobby members:", invitationsError)
        showNotification({
          title: "Error",
          message: "Failed to load lobby members",
          type: "error",
        })
        return
      }

      // Process the invitations to get unique members
      const members = new Map()

      invitations?.forEach((invite) => {
        // Add sender if not current user
        if (invite.sender_id !== currentUser.user.id) {
          const sender = invite.profiles_invitations_sender_id_fkey
          members.set(sender.id, {
            id: sender.id,
            username: sender.username,
            avatar_url: sender.avatar_url,
          })
        }

        // Add receiver if not current user
        if (invite.receiver_id !== currentUser.user.id) {
          const receiver = invite.profiles_invitations_receiver_id_fkey
          members.set(receiver.id, {
            id: receiver.id,
            username: receiver.username,
            avatar_url: receiver.avatar_url,
          })
        }
      })

      // Add current user
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", currentUser.user.id)
        .single()

      if (!profileError && profile) {
        members.set(profile.id, {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          isCurrentUser: true,
        })
      }

      setLobbyMembers(Array.from(members.values()))
    } catch (error) {
      console.error("Error:", error)
      showNotification({
        title: "Error",
        message: "Failed to load lobby data",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <NotificationsContainer />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lobby Characters</h2>
        <Button variant="outline" size="sm" onClick={fetchLobbyMembers} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : lobbyMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lobbyMembers.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-lg border ${member.isCurrentUser ? "border-primary/50 bg-primary/5" : "border-card"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url || "/placeholder.svg"}
                    alt={member.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{member.username}</h3>
                  <p className="text-xs text-muted-foreground">{member.isCurrentUser ? "You" : "Lobby Member"}</p>
                </div>
              </div>

              {/* Character placeholder - in a real app, you'd render the actual character model here */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm font-medium">{member.username}'s Character</p>
                  <p className="text-xs text-muted-foreground">Character model would render here</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-muted rounded-lg">
          <p>No characters in lobby yet</p>
          <p className="text-sm text-muted-foreground mt-1">Invite friends to see their characters here</p>
        </div>
      )}
    </div>
  )
}
