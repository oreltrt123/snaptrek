"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useNotification } from "@/components/ui/notification"

export function EmergencyUserList({ lobbyId }: { lobbyId: string }) {
  const [username, setUsername] = useState("")
  const [storedUsername, setStoredUsername] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { showNotification, NotificationsContainer } = useNotification()

  useEffect(() => {
    // Load username from localStorage
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) {
      setStoredUsername(savedUsername)
    }

    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("profiles").select("id, username").limit(50)

      if (error) {
        console.error("Error fetching users:", error)
        showNotification({
          title: "Error",
          message: "Failed to load users",
          type: "error",
        })
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("Error:", error)
      showNotification({
        title: "Error",
        message: "Failed to load users",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const storeUsername = () => {
    if (username.trim()) {
      localStorage.setItem("username", username)
      setStoredUsername(username)
      showNotification({
        title: "Username Saved",
        message: `Your username is now set to ${username}`,
        type: "success",
      })
    }
  }

  const inviteUser = async (userId: string, username: string) => {
    setInviteLoading(true)
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser()

      if (!userData?.user) {
        showNotification({
          title: "Error",
          message: "You must be logged in to invite users",
          type: "error",
        })
        return
      }

      // Create invitation directly in the database
      const { error } = await supabase.from("invitations").insert({
        sender_id: userData.user.id,
        receiver_id: userId,
        lobby_id: lobbyId,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error sending invitation:", error)
        showNotification({
          title: "Error",
          message: "Failed to send invitation",
          type: "error",
        })
        return
      }

      showNotification({
        title: "Invitation Sent",
        message: `Emergency invitation sent to ${username}`,
        type: "success",
      })
    } catch (error) {
      console.error("Error:", error)
      showNotification({
        title: "Error",
        message: "Failed to send invitation",
        type: "error",
      })
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <NotificationsContainer />
      {!storedUsername && (
        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md mb-4">
          <h3 className="font-medium mb-2">Set Your Username First</h3>
          <div className="flex gap-2">
            <Input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button onClick={storeUsername}>Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Emergency User List</h3>
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : users.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 bg-card rounded-md">
                <span>{user.username}</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => inviteUser(user.id, user.username)}
                  disabled={inviteLoading || !storedUsername}
                >
                  {inviteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Emergency Invite"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-muted rounded-lg">No users found</div>
        )}
      </div>

      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm">
        <p>
          <strong>Note:</strong> This is an emergency system. Use only if the main invitation system isn't working.
        </p>
      </div>
    </div>
  )
}

export function StoreUsername() {
  const [username, setUsername] = useState("")
  const [storedUsername, setStoredUsername] = useState("")
  const { showNotification, NotificationsContainer } = useNotification()

  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) {
      setStoredUsername(savedUsername)
    }
  }, [])

  const handleSave = () => {
    if (username.trim()) {
      localStorage.setItem("username", username)
      setStoredUsername(username)
      showNotification({
        title: "Username Saved",
        message: `Your username is now set to ${username}`,
        type: "success",
      })
    }
  }

  return (
    <div className="p-4 bg-card rounded-lg border">
      <NotificationsContainer />
      <h2 className="text-xl font-bold mb-4">Set Your Username</h2>
      {storedUsername ? (
        <div>
          <p className="mb-2">
            Your current username: <strong>{storedUsername}</strong>
          </p>
          <div className="flex gap-2">
            <Input placeholder="Change username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button onClick={handleSave}>Update</Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Button onClick={handleSave}>Save</Button>
        </div>
      )}
    </div>
  )
}
