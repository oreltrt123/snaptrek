"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ModeSelectionProps {
  userId: string
}

export function ModeSelection({ userId }: ModeSelectionProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const router = useRouter()

  const handleSelectMode = async (mode: string) => {
    try {
      setIsLoading(true)
      setSelectedMode(mode)

      // Get the selected character from localStorage
      const characterId = localStorage.getItem("selectedCharacter") || "default"

      // Call the matchmaking API to find or create a game session
      const response = await fetch("/api/game/matchmaking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          mode,
          characterId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to find a game session")
      }

      const data = await response.json()

      if (data.success && data.gameSessionId) {
        // Navigate to the game page with consistent parameter names
        router.push(`/game/${mode}/${data.gameSessionId}`)
      } else {
        throw new Error("Invalid response from matchmaking service")
      }
    } catch (error) {
      console.error("Error finding game session:", error)
      console.error("Failed to find a game session. Please try again.")
      alert("Failed to find a game session. Please try again.")
      setIsLoading(false)
      setSelectedMode(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-white">Select Game Mode</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => handleSelectMode("solo")}
          disabled={isLoading}
          className={`h-24 ${
            selectedMode === "solo" ? "bg-purple-700 border-2 border-purple-400" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <div className="text-center">
            <div className="text-lg font-bold">Solo</div>
            <div className="text-xs text-gray-300">Play individually in a shared world</div>
          </div>
        </Button>

        <Button
          onClick={() => handleSelectMode("duo")}
          disabled={isLoading}
          className={`h-24 ${
            selectedMode === "duo" ? "bg-purple-700 border-2 border-purple-400" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <div className="text-center">
            <div className="text-lg font-bold">Duo</div>
            <div className="text-xs text-gray-300">Team up with one other player</div>
          </div>
        </Button>

        <Button
          onClick={() => handleSelectMode("trio")}
          disabled={isLoading}
          className={`h-24 ${
            selectedMode === "trio" ? "bg-purple-700 border-2 border-purple-400" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <div className="text-center">
            <div className="text-lg font-bold">Trio</div>
            <div className="text-xs text-gray-300">Form a team of three players</div>
          </div>
        </Button>

        <Button
          onClick={() => handleSelectMode("duel")}
          disabled={isLoading}
          className={`h-24 ${
            selectedMode === "duel" ? "bg-purple-700 border-2 border-purple-400" : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          <div className="text-center">
            <div className="text-lg font-bold">Duel</div>
            <div className="text-xs text-gray-300">1v1 competitive mode</div>
          </div>
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-white">Finding a game...</span>
        </div>
      )}
    </div>
  )
}
