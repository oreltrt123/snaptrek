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

// Define lobby member type
interface LobbyMember {
  id: string
  username: string
  position: number
  avatar_url?: string
}

export default function LobbyContent() {
  const { user, isLoading } = useAuth()
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [availablePosition, setAvailablePosition] = useState(0)
  const [members, setMembers] = useState<LobbyMember[]>([])
  const [lobbyId, setLobbyId] = useState<string>("")

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true)
    // Generate a lobby ID if not already set
    if (!lobbyId) {
      setLobbyId(crypto.randomUUID())
    }
  }, [lobbyId])

  // Fetch lobby members
  useEffect(() => {
    if (lobbyId) {
      fetchMembers()
    }
  }, [lobbyId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/lobby/members?lobbyId=${lobbyId}`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      } else {
        console.error("Error fetching members:", await response.text())
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  useEffect(() => {
    // Check if we're returning from the locker page
    if (typeof window !== "undefined") {
      const fromLocker = sessionStorage.getItem("fromLocker")
      if (fromLocker === "true") {
        setShowNotification(true)
        sessionStorage.removeItem("fromLocker")

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false)
        }, 3000)
      }
    }
  }, [])

  const handleOpenModeSelector = () => {
    setShowModeSelector(true)
  }

  const handleModeSelect = (mode: string) => {
    setShowModeSelector(false)

    // Store the selected mode
    const modeName = getModeName(mode)
    setSelectedMode({ id: mode, name: modeName })

    // Show notification
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
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

  const handleOpenUserSearch = (position: number) => {
    setAvailablePosition(position)
    setShowUserSearch(true)
  }

  const handleCloseUserSearch = () => {
    setShowUserSearch(false)
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

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* 3D Scene Container - Full screen */}
      <div className="absolute inset-0 z-0">
        {/* Only render the 3D scene when the component is mounted */}
        {mounted && (
          <LobbyScene
            onClickLeftPlatform={() => handleOpenUserSearch(1)}
            onClickRightPlatform={() => handleOpenUserSearch(2)}
            members={members}
          />
        )}
      </div>

      {/* UI Layer */}
      <div className="relative z-10 flex flex-col h-screen">
        {showNotification && (
          <div className="absolute top-4 right-4 z-50 w-80">
            <Alert className={selectedMode ? "bg-purple-900/50 border-purple-500" : "bg-green-900/50 border-green-500"}>
              <AlertTitle>{selectedMode ? "Game Mode Selected" : "Character Updated"}</AlertTitle>
              <AlertDescription>
                {selectedMode
                  ? `You've selected ${selectedMode.name}. Click PLAY to start!`
                  : "Your character selection has been applied."}
              </AlertDescription>
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

        {/* Spacer to push buttons to bottom */}
        <div className="flex-grow"></div>

        {/* Game Mode and Play Buttons */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          {/* Mode Button */}
          <div className="flex items-center gap-3">
            <button onClick={handleOpenModeSelector} className="tab bg-cyan-600 hover:bg-cyan-700">
              <Settings className="mr-2 h-5 w-5" />
              MODE
            </button>

            {/* Selected Mode Display */}
            {selectedMode && (
              <div className="px-4 py-2 bg-purple-900/70 rounded-lg border border-purple-500 text-white font-semibold">
                {selectedMode.name}
              </div>
            )}
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
      {showUserSearch && (
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
