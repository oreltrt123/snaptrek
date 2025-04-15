"use client"

import { useState, useEffect } from "react"
import { X, Search, Users, UserPlus, Mail, RefreshCw, UserCheck } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface Invitation {
  id: string
  sender: {
    username: string
    avatar_url: string | null
  }
  created_at: string
}

interface Friend {
  id: string
  username: string
  avatar_url: string | null
}

interface ImprovedUserSidebarProps {
  isOpen: boolean
  onClose: () => void
  lobbyId: string
  availablePosition?: number
}

export default function ImprovedUserSidebar({
  isOpen,
  onClose,
  lobbyId,
  availablePosition = 1,
}: ImprovedUserSidebarProps) {
  const [activeTab, setActiveTab] = useState("all-users")
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const supabase = createClientComponentClient()

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lobby/all-users`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setUsers([])
      } else {
        setUsers(data.users || [])
      }
    } catch (err) {
      setError("Failed to load users. Please try again.")
      console.error("Error fetching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch invitations
  const fetchInvitations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lobby/invitations?lobbyId=${lobbyId}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setInvitations([])
      } else {
        setInvitations(data.invitations || [])
      }
    } catch (err) {
      setError("Failed to load invitations. Please try again.")
      console.error("Error fetching invitations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch friends
  const fetchFriends = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lobby/friends`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setFriends([])
      } else {
        setFriends(data.friends || [])
      }
    } catch (err) {
      setError("Failed to load friends. Please try again.")
      console.error("Error fetching friends:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Search users
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      await fetchAllUsers()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/lobby/search-users?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setUsers([])
      } else {
        setUsers(data.users || [])
      }
    } catch (err) {
      setError("Failed to search users. Please try again.")
      console.error("Error searching users:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Send invitation
  const sendInvitation = async (recipientId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in to send invitations")
        return
      }

      const response = await fetch("/api/lobby/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.id,
          recipientId,
          lobbyId,
          position: availablePosition,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setNotification({ type: "error", message: data.error })
      } else {
        setNotification({ type: "success", message: "Invitation sent successfully!" })
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to send invitation. Please try again." })
      console.error("Error sending invitation:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load data based on active tab
  useEffect(() => {
    if (!isOpen) return

    if (activeTab === "all-users") {
      fetchAllUsers()
    } else if (activeTab === "invitations") {
      fetchInvitations()
    } else if (activeTab === "friends") {
      fetchFriends()
    }
  }, [isOpen, activeTab])

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [notification])

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-900 text-white shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-bold">Invite to Lobby</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-2">
          <Alert
            className={
              notification.type === "success" ? "bg-green-900/50 border-green-500" : "bg-red-900/50 border-red-500"
            }
          >
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="all-users" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-gray-800">
          <TabsList className="w-full bg-gray-900">
            <TabsTrigger value="all-users" className="flex-1 data-[state=active]:bg-gray-800">
              <Users className="h-4 w-4 mr-2" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex-1 data-[state=active]:bg-gray-800">
              <Mail className="h-4 w-4 mr-2" />
              Invites
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 data-[state=active]:bg-gray-800">
              <UserCheck className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>
        </div>

        {/* All Users Tab */}
        <TabsContent value="all-users" className="flex-1 flex flex-col p-0 m-0">
          <div className="p-2">
            <div className="relative">
              <Input
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                className="bg-gray-800 border-gray-700 text-white pr-10"
              />
              <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full" onClick={searchUsers}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchAllUsers}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No users found.</p>
                <Button variant="outline" size="sm" onClick={fetchAllUsers} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {users.map((user) => (
                  <div key={user.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url || "/placeholder.svg"}
                            alt={user.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span>{user.username}</span>
                    </div>
                    <Button size="sm" onClick={() => sendInvitation(user.id)} disabled={isLoading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-800">
            <Button variant="outline" className="w-full" onClick={fetchAllUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh List
            </Button>
          </div>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchInvitations}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No invitations found.</p>
                <Button variant="outline" size="sm" onClick={fetchInvitations} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-3">
                    <div className="flex items-center mb-2">
                      <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                        {invitation.sender.avatar_url ? (
                          <img
                            src={invitation.sender.avatar_url || "/placeholder.svg"}
                            alt={invitation.sender.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold">
                            {invitation.sender.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{invitation.sender.username}</p>
                        <p className="text-xs text-gray-400">{new Date(invitation.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        Accept
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-800">
            <Button variant="outline" className="w-full" onClick={fetchInvitations}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Invitations
            </Button>
          </div>
        </TabsContent>

        {/* Friends Tab */}
        <TabsContent value="friends" className="flex-1 flex flex-col p-0 m-0">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-400 mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchFriends}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : friends.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No friends found.</p>
                <Button variant="outline" size="sm" onClick={fetchFriends} className="mt-2">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {friends.map((friend) => (
                  <div key={friend.id} className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center mr-3">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url || "/placeholder.svg"}
                            alt={friend.username}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <span className="text-lg font-bold">{friend.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <span>{friend.username}</span>
                    </div>
                    <Button size="sm" onClick={() => sendInvitation(friend.id)} disabled={isLoading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-800">
            <Button variant="outline" className="w-full" onClick={fetchFriends}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Friends
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
