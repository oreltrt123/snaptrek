"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import "@/style/lobby.css"
import { useAuth } from "@/lib/auth-provider"
import { UserSearchSidebar } from "@/components/lobby/user-search-sidebar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Import the GameModeSelector component normally since it doesn't use Three.js
import { GameModeSelector } from "@/components/game/game-mode-selector"

// Dynamically import the LobbyScene component with SSR disabled and error handling
const LobbyScene = dynamic(() => import("@/components/game/lobby-scene").then((mod) => ({ default: mod.LobbyScene })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

// Define game mode types
interface GameMode {
  id: string
  name: string
}

interface LobbyMember {
  id: string
  position: number
  profiles: {
    id: string
    username: string
    avatar_url?: string
  }
}

export default function LobbyContent() {
  const { user, isLoading } = useAuth()
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"success" | "info" | "warning" | "error">("info")
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [activePlatform, setActivePlatform] = useState<1 | 2 | null>(null)
  const [lobbyId, setLobbyId] = useState<string>("")
  const [lobbyMembers, setLobbyMembers] = useState<LobbyMember[]>([])
  const [debugMessage, setDebugMessage] = useState<string>("")
  const supabase = createClientComponentClient()

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true)

    // Generate a unique lobby ID if not already set
    if (!lobbyId) {
      setLobbyId(crypto.randomUUID())
    }
  }, [lobbyId])

  // Set up real-time subscription for lobby members
  useEffect(() => {
    if (!user || !lobbyId) return

    // Add the current user as the owner (position 0)
    const setupLobby = async () => {
      try {
        // Check if user is already in a lobby
        const { data: existingMember } = await supabase
          .from("lobby_members")
          .select()
          .eq("user_id", user.id)
          .eq("lobby_id", lobbyId)
          .single()

        if (!existingMember) {
          // Add user as lobby owner
          await supabase.from("lobby_members").insert({
            lobby_id: lobbyId,
            user_id: user.id,
            position: 0,
          })
        }

        // Fetch initial members
        fetchLobbyMembers()
      } catch (error) {
        console.error("Error setting up lobby:", error)
      }
    }

    setupLobby()

    // Subscribe to changes in lobby_members table
    const subscription = supabase
      .channel(`lobby_${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_members",
          filter: `lobby_id=eq.${lobbyId}`,
        },
        () => {
          fetchLobbyMembers()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, lobbyId, supabase])

  // Fetch lobby members
  const fetchLobbyMembers = async () => {
    if (!lobbyId) return

    try {
      const { data, error } = await supabase
        .from("lobby_members")
        .select(`
          id, position, 
          profiles:user_id (id, username, avatar_url)
        `)
        .eq("lobby_id", lobbyId)
        .order("position")

      if (error) {
        console.error("Error fetching lobby members:", error)
        return
      }

      setLobbyMembers(data || [])

      // Show notification when a new member joins
      const leftMember = data?.find((m) => m.position === 1)
      const rightMember = data?.find((m) => m.position === 2)

      if (leftMember && !lobbyMembers.some((m) => m.position === 1)) {
        showTemporaryNotification(`${leftMember.profiles.username} joined your lobby!`, "success")
      }

      if (rightMember && !lobbyMembers.some((m) => m.position === 2)) {
        showTemporaryNotification(`${rightMember.profiles.username} joined your lobby!`, "success")
      }
    } catch (error) {
      console.error("Error fetching lobby members:", error)
    }
  }

  useEffect(() => {
    // Check if we're returning from the locker page
    if (typeof window !== "undefined") {
      const fromLocker = sessionStorage.getItem("fromLocker")
      if (fromLocker === "true") {
        showTemporaryNotification("Your character selection has been applied.", "success")
        sessionStorage.removeItem("fromLocker")
      }
    }
  }, [])

  const showTemporaryNotification = (message: string, type: "success" | "info" | "warning" | "error" = "info") => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)

    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  const handleOpenModeSelector = () => {
    setShowModeSelector(true)
  }

  const handleModeSelect = (mode: string) => {
    setShowModeSelector(false)

    // Store the selected mode
    const modeName = getModeName(mode)
    setSelectedMode({ id: mode, name: modeName })

    // Show notification
    showTemporaryNotification(`You've selected ${modeName}. Click PLAY to start!`, "info")
  }

  const handlePlay = () => {
    if (selectedMode) {
      // Generate a unique game session ID
      const gameSessionId = crypto.randomUUID()
      router.push(`/game/${selectedMode.id}/${gameSessionId}`)
    } else {
      // If no mode is selected, show the mode selector
      setShowModeSelector(true)
    }
  }

  const handleClickLeftPlatform = () => {
    setDebugMessage("Left platform clicked!")
    setActivePlatform(1)
    setShowUserSearch(true)
  }

  const handleClickRightPlatform = () => {
    setDebugMessage("Right platform clicked!")
    setActivePlatform(2)
    setShowUserSearch(true)
  }

  const handleCloseUserSearch = () => {
    setShowUserSearch(false)
    setActivePlatform(null)
  }

  // Helper function to get mode display name
  const getModeName = (modeId: string): string => {
    switch (modeId) {
      case "solo":
        return "Solo Mode"
      case "duo":
        return "Duo Mode"
      case "trio":
        return "Trio Mode"
      case "duel":
        return "Duel Mode"
      default:
        return "Custom Mode"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Error Loading Lobby</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700">
            Return to Login
          </Button>
        </div>
      </div>
    )
  }

  // Find available position
  const isLeftPositionAvailable = !lobbyMembers.some((m) => m.position === 1)
  const isRightPositionAvailable = !lobbyMembers.some((m) => m.position === 2)
  const availablePosition = activePlatform || (isLeftPositionAvailable ? 1 : isRightPositionAvailable ? 2 : null)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* 3D Scene Container - Full screen */}
      <div className="absolute inset-0 z-0">
        {/* Only render the 3D scene when the component is mounted */}
        {mounted && (
          <LobbyScene
            onClickLeftPlatform={handleClickLeftPlatform}
            onClickRightPlatform={handleClickRightPlatform}
            members={lobbyMembers}
          />
        )}
      </div>

      {/* UI Layer */}
      <div className="relative z-10 flex flex-col h-screen">
        {showNotification && (
          <div className="absolute top-4 right-4 z-50 w-80">
            <Alert
              className={
                notificationType === "success"
                  ? "bg-green-900/50 border-green-500"
                  : notificationType === "error"
                    ? "bg-red-900/50 border-red-500"
                    : notificationType === "warning"
                      ? "bg-yellow-900/50 border-yellow-500"
                      : "bg-purple-900/50 border-purple-500"
              }
            >
              <AlertTitle>
                {notificationType === "success"
                  ? "Success"
                  : notificationType === "error"
                    ? "Error"
                    : notificationType === "warning"
                      ? "Warning"
                      : "Information"}
              </AlertTitle>
              <AlertDescription>{notificationMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Debug message */}
        {debugMessage && (
          <div className="absolute top-20 right-4 z-50 w-80">
            <Alert className="bg-blue-900/50 border-blue-500">
              <AlertTitle>Debug</AlertTitle>
              <AlertDescription>{debugMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
            <p className="text-gray-300">Welcome, {user?.user_metadata?.username || "Player"}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-2 border-yellow-500 text-white hover:bg-yellow-500/20"
              onClick={() => router.push("/store")}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Store
            </Button>
            <Button
              variant="outline"
              className="border-2 border-purple-500 text-white hover:bg-purple-500/20"
              onClick={() => router.push("/locker")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Character
            </Button>
          </div>
        </div>

        {/* Manual test buttons (for development) */}
        <div className="absolute top-20 left-4 z-50 flex flex-col gap-2">
          <Button size="sm" onClick={handleClickLeftPlatform} className="bg-purple-700 hover:bg-purple-600">
            Test Left Platform
          </Button>
          <Button size="sm" onClick={handleClickRightPlatform} className="bg-purple-700 hover:bg-purple-600">
            Test Right Platform
          </Button>
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-grow"></div>

        {/* Game Mode and Play Buttons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Mode Button */}
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
            <button onClick={handleOpenModeSelector} className="tab2">
              MODE
              {selectedMode && (
                <div className="px-4 py-2 bg-none rounded-lg borde text-white font-semibold">{selectedMode.name}</div>
              )}
            </button>
          </div>

          {/* Play Button */}
          <button onClick={handlePlay} className="tab">
            PLAY!
          </button>
        </div>
      </div>

      {/* Game Mode Selector Modal */}
      {showModeSelector && (
        <GameModeSelector onSelect={(mode, id) => handleModeSelect(mode)} onClose={() => setShowModeSelector(false)} />
      )}

      {/* User Search Sidebar */}
      {showUserSearch && availablePosition && (
        <UserSearchSidebar
          isOpen={showUserSearch}
          onClose={handleCloseUserSearch}
          lobbyId={lobbyId}
          availablePosition={availablePosition}
        />
      )}
    </div>
  )
}
