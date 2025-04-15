"use client"

import { useState, useEffect } from "react"
import { X, Search, UserPlus, Check, XIcon, Users, AlertTriangle, RefreshCw, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  id: string
  username: string
  avatar_url?: string
}

interface Invitation {
  id: string
  sender_id: string
  recipient_id: string
  status: "pending" | "accepted" | "declined"
  lobby_id: string
  created_at: string
  sender?: {
    username: string
    avatar_url?: string
  }
}

interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

interface UserListSidebarProps {
  isOpen: boolean
  onClose: () => void
  lobbyId: string
  availablePosition: number
}

export function UserListSidebar({ isOpen, onClose, lobbyId, availablePosition }: UserListSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [error, setError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("everyone") // Default to everyone tab

  // Simple notification system
  const showNotification = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Fetch all users and invitations on mount
  useEffect(() => {
    if (isOpen) {
      fetchAllUsers()
      fetchInvitations()
    }
  }, [isOpen, lobbyId])

  // Fetch all users
  const fetchAllUsers = async () => {
    setIsLoadingAllUsers(true)
    setError(null)

    try {
      console.log("Fetching all users...")
      const response = await fetch("/api/lobby/all-users")

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`All users API error (${response.status}):`, errorText)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("All users API response:", data)

      if (Array.isArray(data.users)) {
        setAllUsers(data.users)
        console.log(`Loaded ${data.users.length} users successfully`)
      } else {
        console.error("Unexpected data format:", data)
        setError("Received invalid data format from server")
        setAllUsers([])
      }
    } catch (error) {
      console.error("Error fetching all users:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch users")
      showNotification("There was a problem loading the user list. Please try again.", "error")
      setAllUsers([])
    } finally {
      setIsLoadingAllUsers(false)
    }
  }

  // Fetch invitations
  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/lobby/invitations?lobbyId=${lobbyId}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error response (${response.status}):`, errorText)
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.invitations) {
        setInvitations(data.invitations)
      } else {
        setInvitations([])
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
      showNotification("Failed to load invitations. Please try again.", "error")
    }
  }

  // Search for users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch(`/api/lobby/search-users?query=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error response (${response.status}):`, errorText)
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (Array.isArray(data.users)) {
        setSearchResults(data.users)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Error searching users:", error)
      setError(error instanceof Error ? error.message : "Failed to search users")
      showNotification("Failed to search for users. Please try again.", "error")
    } finally {
      setIsSearching(false)
    }
  }

  // Send invitation
  const sendInvitation = async (userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/lobby/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientId: userId,
          lobbyId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showNotification("Your invitation has been sent successfully.", "success")
        // Refresh invitations
        fetchInvitations()
      } else {
        showNotification(data.error || "Failed to send invitation. Please try again.", "error")
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
      showNotification("Failed to send invitation. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Respond to invitation
  const respondToInvitation = async (invitationId: string, status: "accepted" | "declined") => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/lobby/respond-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId,
          status,
          position: availablePosition,
        }),
      })

      const data = await response.json()

      if (data.success) {
        showNotification(
          status === "accepted" ? "You have joined the lobby." : "You have declined the invitation.",
          "success",
        )

        // Refresh invitations
        fetchInvitations()

        // Close sidebar if accepted
        if (status === "accepted") {
          onClose()
        }
      } else {
        showNotification(data.error || "Failed to respond to invitation. Please try again.", "error")
      }
    } catch (error) {
      console.error("Error responding to invitation:", error)
      showNotification("Failed to respond to invitation. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Retry fetching all users
  const handleRetryFetchAllUsers = () => {
    fetchAllUsers()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gray-900/95 border-l border-purple-800 shadow-xl z-50 flex flex-col">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-72">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            className={
              notification.type === "success"
                ? "bg-green-900/50 border-green-500"
                : notification.type === "error"
                  ? "bg-red-900/50 border-red-500"
                  : notification.type === "warning"
                    ? "bg-yellow-900/50 border-yellow-500"
                    : "bg-purple-900/50 border-purple-500"
            }
          >
            <AlertTitle className="flex items-center gap-2">
              {notification.type === "success" ? (
                "Success"
              ) : notification.type === "error" ? (
                <>
                  <AlertTriangle className="h-4 w-4" /> Error
                </>
              ) : notification.type === "warning" ? (
                "Warning"
              ) : (
                "Information"
              )}
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 border-b border-purple-800">
        <h2 className="text-xl font-bold text-white">Players</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Tabs defaultValue="everyone" className="flex-1 flex flex-col" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mx-4 mt-4">
          <TabsTrigger value="everyone">Everyone</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="invites">Invites {invitations.length > 0 && `(${invitations.length})`}</TabsTrigger>
        </TabsList>

        {/* EVERYONE TAB - Shows all registered users */}
        <TabsContent value="everyone" className="flex-1 flex flex-col p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-medium text-white">All Players</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetryFetchAllUsers}
              disabled={isLoadingAllUsers}
              className="ml-auto text-purple-400 hover:text-purple-300"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingAllUsers ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoadingAllUsers ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-4 w-full">
                  <h4 className="text-red-400 font-medium mb-2">Error</h4>
                  <p className="text-red-300 text-sm mb-2">{error}</p>
                </div>
                <Button onClick={handleRetryFetchAllUsers} className="bg-purple-700 hover:bg-purple-600">
                  Try Again
                </Button>
              </div>
            ) : allUsers.length > 0 ? (
              <ul className="space-y-2">
                {allUsers.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-800/50 hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-purple-700">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{user.username || "Unknown User"}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendInvitation(user.id)}
                      disabled={isLoading}
                      className="bg-purple-700 hover:bg-purple-600"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <UserCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No other users found.</p>
                <Button
                  onClick={handleRetryFetchAllUsers}
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-900/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* SEARCH TAB - For searching specific users */}
        <TabsContent value="search" className="flex-1 flex flex-col p-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-gray-800 border-purple-700"
            />
            <Button onClick={handleSearch} disabled={isSearching} className="bg-purple-700 hover:bg-purple-600">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md bg-gray-800/50 hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-purple-700">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">{user.username || "Unknown User"}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => sendInvitation(user.id)}
                      disabled={isLoading}
                      className="bg-purple-700 hover:bg-purple-600"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                  </li>
                ))}
              </ul>
            ) : searchQuery ? (
              <p className="text-center text-gray-400 py-8">No users found. Try a different search.</p>
            ) : (
              <p className="text-center text-gray-400 py-8">Search for players to invite them to your lobby.</p>
            )}
          </div>
        </TabsContent>

        {/* INVITES TAB - Shows pending invitations */}
        <TabsContent value="invites" className="flex-1 flex flex-col p-4">
          <h3 className="text-lg font-medium text-white mb-4">Pending Invitations</h3>

          <div className="flex-1 overflow-y-auto">
            {invitations.length > 0 ? (
              <ul className="space-y-2">
                {invitations.map((invitation) => (
                  <li key={invitation.id} className="flex items-center justify-between p-2 rounded-md bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            invitation.sender?.avatar_url ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${invitation.sender?.username}`
                          }
                          alt={invitation.sender?.username}
                        />
                        <AvatarFallback className="bg-purple-700">
                          {invitation.sender?.username?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-white">{invitation.sender?.username || "Unknown"}</span>
                        <span className="text-xs text-gray-400">wants to play with you</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => respondToInvitation(invitation.id, "accepted")}
                        disabled={isLoading}
                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-900/20"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => respondToInvitation(invitation.id, "declined")}
                        disabled={isLoading}
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">No pending invitations.</p>
                <p className="text-gray-500 text-sm">When someone invites you to play, it will appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
