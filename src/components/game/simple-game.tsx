"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-provider"
import dynamic from "next/dynamic"

// Dynamically import the game scene component
const GameScene = dynamic(() => import("@/components/game/game-scene").then((mod) => ({ default: mod.GameScene })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

export default function SimpleGamePage() {
  const { user, isLoading } = useAuth()
  const [gameLoaded, setGameLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [showControls, setShowControls] = useState(true)
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState({ title: "", description: "" })
  const [gameMode, setGameMode] = useState("solo")
  const [sessionId, setSessionId] = useState("")
  const router = useRouter()

  // Get the mode display name
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

  useEffect(() => {
    // Get game info from localStorage
    if (typeof window !== "undefined") {
      const storedMode = localStorage.getItem("currentGameMode")
      const storedSession = localStorage.getItem("currentGameSession")

      if (storedMode) {
        setGameMode(storedMode)
      }

      if (storedSession) {
        setSessionId(storedSession)
      } else {
        // Generate a fallback session ID if none exists
        setSessionId(crypto.randomUUID())
      }
    }

    // Show welcome notification
    showTemporaryNotification({
      title: `${getModeName(gameMode)} Started`,
      description: "Use WASD to move and mouse to look around.",
    })
  }, [gameMode])

  const showTemporaryNotification = (message: { title: string; description: string }) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  const handlePositionUpdate = (newPosition: { x: number; y: number; z: number }) => {
    setPosition(newPosition)
  }

  const handleExitGame = () => {
    router.push("/lobby")
  }

  const toggleControls = () => {
    setShowControls((prev) => !prev)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/login")
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Game Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push("/lobby")} className="bg-red-600 hover:bg-red-700">
            Return to Lobby
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Game Scene Container - Full screen */}
      <div className="absolute inset-0 z-0">
        <GameScene
          mode={gameMode}
          sessionId={sessionId}
          onLoad={() => setGameLoaded(true)}
          onPositionUpdate={handlePositionUpdate}
        />
      </div>

      {/* UI Layer */}
      <div className="relative z-10 flex flex-col h-screen pointer-events-none">
        {showNotification && (
          <div className="absolute top-4 right-4 z-50 w-80 pointer-events-auto">
            <Alert className="bg-purple-900/50 border-purple-500">
              <AlertTitle>{notificationMessage.title}</AlertTitle>
              <AlertDescription>{notificationMessage.description}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Game Info */}
        <div className="p-4 flex justify-between items-center pointer-events-auto">
          <div>
            <h1 className="text-xl font-bold text-white">{getModeName(gameMode)}</h1>
            <p className="text-gray-300">Session: {sessionId.substring(0, 8)}...</p>
          </div>
        </div>

        {/* Position Display */}
        {showControls && (
          <div className="absolute bottom-4 left-4 bg-black/70 p-2 rounded text-white text-xs font-mono pointer-events-auto">
            <p>X: {position.x.toFixed(2)}</p>
            <p>Y: {position.y.toFixed(2)}</p>
            <p>Z: {position.z.toFixed(2)}</p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleControls}
            className="border-gray-500 text-white hover:bg-gray-700"
          >
            {showControls ? "Hide HUD" : "Show HUD"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExitGame}
            className="border-red-500 text-white hover:bg-red-900/20"
          >
            Exit Game
          </Button>
        </div>
      </div>

      {/* Loading Overlay */}
      {!gameLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white text-xl">Loading {getModeName(gameMode)}...</p>
          </div>
        </div>
      )}
    </div>
  )
}
