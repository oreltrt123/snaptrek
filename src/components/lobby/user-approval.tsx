"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useNotification } from "@/components/ui/notification"

export function UserApproval() {
  const [users, setUsers] = useState<any[]>([])
  const [approvedUsers, setApprovedUsers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const { showNotification, NotificationsContainer } = useNotification()

  // Load approved users from localStorage on component mount
  useEffect(() => {
    const storedApprovedUsers = localStorage.getItem("approvedUsers")
    if (storedApprovedUsers) {
      setApprovedUsers(JSON.parse(storedApprovedUsers))
    }

    fetchUsers()
  }, [])

  // Save approved users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("approvedUsers", JSON.stringify(approvedUsers))
  }, [approvedUsers])

  const fetchUsers = async () => {
    setLoading(true)

    try {
      // First try the API endpoint
      const response = await fetch("/api/all-users")

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        // Fallback to direct Supabase query
        const { data, error } = await supabase.from("profiles").select("id, username, avatar_url").limit(50)

        if (error) {
          console.error("Error fetching users:", error)
          return
        }

        setUsers(data || [])
      }
    } catch (error) {
      console.error("Error:", error)

      // Final fallback - direct Supabase query
      try {
        const { data, error } = await supabase.from("profiles").select("id, username, avatar_url").limit(50)

        if (error) {
          console.error("Error in fallback fetch:", error)
          return
        }

        setUsers(data || [])
      } catch (e) {
        console.error("Final fallback error:", e)
      }
    } finally {
      setLoading(false)
    }
  }

  const approveUser = (user: any) => {
    if (!approvedUsers.some((u) => u.id === user.id)) {
      setApprovedUsers([...approvedUsers, user])
      showNotification({
        title: "User Approved",
        message: `${user.username} has been added to your approved list.`,
        type: "success",
      })
    }
  }

  const disapproveUser = (userId: string) => {
    setApprovedUsers(approvedUsers.filter((user) => user.id !== userId))
    showNotification({
      title: "User Removed",
      message: "User has been removed from your approved list.",
      type: "error",
    })
  }

  const filteredUsers = searchQuery
    ? users.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    : users

  return (
    <div className="space-y-6">
      <NotificationsContainer />
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Find Users</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">All Users</h3>
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {filteredUsers.map((user) => (
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
                  variant={approvedUsers.some((u) => u.id === user.id) ? "outline" : "default"}
                  onClick={() => approveUser(user)}
                  disabled={approvedUsers.some((u) => u.id === user.id)}
                >
                  {approvedUsers.some((u) => u.id === user.id) ? "Approved" : "Approve"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-muted rounded-lg">No users found</div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Approved Users</h3>
        {approvedUsers.length > 0 ? (
          <div className="space-y-2">
            {approvedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-green-500/20"
              >
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
                <Button size="sm" variant="destructive" onClick={() => disapproveUser(user.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-muted rounded-lg">No approved users yet</div>
        )}
      </div>
    </div>
  )
}
