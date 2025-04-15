"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GameView } from "@/components/game/game-view"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function GamePage({
  params,
}: {
  params: { mode: string; id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Validate the game mode
  const validModes = ["solo", "duo", "trio", "duel"]

  useEffect(() => {
    console.log("Game page - Mode:", params.mode, "ID:", params.id)

    // Check if the mode is valid
    if (!validModes.includes(params.mode)) {
      console.error("Invalid game mode:", params.mode)
      setError("Invalid game mode")
      return
    }

    // Simulate checking if the user is authenticated
    const isAuthenticated = true // In a real app, check localStorage or session

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    setLoading(false)
  }, [params.mode, params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <Button onClick={() => router.push("/lobby")} className="bg-red-600 hover:bg-red-700">
            Return to Lobby
          </Button>
        </div>
      </div>
    )
  }

  // For client-side rendering, we'll use a dummy userId
  // In a real app, you'd get this from the session
  const dummyUserId = "user-123"

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Game View Component */}
      <GameView mode={params.mode} gameId={params.id} userId={dummyUserId} />

      {/* Exit Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          onClick={() => router.push("/lobby")}
          variant="outline"
          className="border-2 border-red-500 text-white hover:bg-red-500/20"
        >
          <Home className="mr-2 h-4 w-4" />
          Exit Game
        </Button>
      </div>
    </div>
  )
}
