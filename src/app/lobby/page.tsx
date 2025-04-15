"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Settings, ShoppingBag } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import { LobbySceneWithCharacter } from "@/components/game/lobby-scene-with-character"
import { GameModeSelector } from "@/components/game/game-mode-selector"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import "@/style/lobby.css"

// Define game mode types
interface GameMode {
  id: string
  name: string
}

export default function LobbyPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModeSelector, setShowModeSelector] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const router = useRouter()
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.log("Session check error:", error.message)
          router.push("/login")
          return
        }

        if (!data.session) {
          router.push("/login")
          return
        }

        setUser(data.session.user)
        setLoading(false)
      } catch {
        // No need to capture the error variable
        console.log("Error checking session")
        router.push("/login")
      }
    }

    checkSession()
  }, [router])

  useEffect(() => {
    // Check if we're returning from the locker page
    const fromLocker = sessionStorage.getItem("fromLocker")
    if (fromLocker === "true") {
      setShowNotification(true)
      sessionStorage.removeItem("fromLocker")

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 3000)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative">
      {/* 3D Scene Container - Full screen */}
      <div className="absolute inset-0 z-0">
        {/* IMPORTANT: Removed the key prop that was causing remounting */}
        <LobbySceneWithCharacter />
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
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2">
        <button onClick={handleOpenModeSelector} className="tab2">
           MODE             {selectedMode && (
              <div className="px-4 py-2 bg-none rounded-lg border text-white font-semibold">
                {selectedMode.name}
              </div>
            )}
        </button>
      </div>

          {/* Play Button */}
          <button onClick={handlePlay} className="tab">
            PLAY!
          </button>
        </div>
      </div>

      {/* Game Mode Selector Modal - Using Portal to prevent re-renders */}
      {showModeSelector && (
        <GameModeSelectorWrapper onSelect={handleModeSelect} onClose={() => setShowModeSelector(false)} />
      )}
    </div>
  )
}

// Wrapper component to prevent re-renders of the main scene
function GameModeSelectorWrapper({
  onSelect,
  onClose,
}: {
  onSelect: (mode: string) => void
  onClose: () => void
}) {
  // Create a wrapper function that ignores the id parameter
  const handleSelect = (mode: string) => {
    onSelect(mode)
  }

  return <GameModeSelector onSelect={handleSelect} onClose={onClose} />
}
