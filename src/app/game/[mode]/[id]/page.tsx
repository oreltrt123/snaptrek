"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GameView } from "@/components/game/game-view"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function GamePage({
  params,
}: {
  params: { mode: string; id: string }
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

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

    // Get the user ID from Supabase
    const getUserId = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          console.log("User authenticated:", session.user.id)
          setUserId(session.user.id)
        } else {
          // Try to get from localStorage as fallback
          const localUserId = localStorage.getItem("userId")
          if (localUserId) {
            console.log("Using userId from localStorage:", localUserId)
            setUserId(localUserId)
          } else {
            console.log("No user ID found, using fallback")
            // Use a fallback ID for testing
            setUserId("user-123")
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Error getting user session:", error)
        setError("Authentication error")
      }
    }

    getUserId()
  }, [params.mode, params.id, supabase.auth])

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

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
          <p className="mb-4">Unable to determine user ID. Please log in again.</p>
          <Button onClick={() => router.push("/login")} className="bg-red-600 hover:bg-red-700">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Game View Component */}
      <GameView mode={params.mode} gameId={params.id} userId={userId} />

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
