"use client"

import { useState, useEffect } from "react"
import { GameHUD } from "./game-hud"
import { GamePlayerCounter } from "./game-player-counter"
import { GameControls } from "./game-controls"
import { GameInstructions } from "./game-instructions"
import { KeyboardDebug } from "./keyboard-debug"
import { MovementDebug } from "./movement-debug"
import dynamic from "next/dynamic"

// Dynamically import the 3D game scene to avoid SSR issues
const Game3DScene = dynamic(() => import("./game-3d-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

interface GameViewProps {
  mode: string
  gameId: string
  userId: string
}

export function GameView({ mode, gameId, userId }: GameViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerCount] = useState(1)
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [isMobile, setIsMobile] = useState(false)
  const [characterId, setCharacterId] = useState<string | null>(null)

  useEffect(() => {
    console.log("GameView - Mode:", mode, "Game ID:", gameId, "User ID:", userId)

    // Try to get the character ID from localStorage
    const savedCharacter = localStorage.getItem("selectedCharacter")
    if (savedCharacter) {
      console.log("Found character in localStorage:", savedCharacter)
      setCharacterId(savedCharacter)
    }

    // Check if device is mobile
    setIsMobile(window.innerWidth < 768)

    // Set max players based on mode
    switch (mode) {
      case "solo":
        setMaxPlayers(10)
        break
      case "duo":
        setMaxPlayers(10) // 5 teams of 2
        break
      case "trio":
        setMaxPlayers(12) // 4 teams of 3
        break
      case "duel":
        setMaxPlayers(2) // 1v1
        break
      default:
        setMaxPlayers(10)
    }

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [mode, gameId, userId])

  if (isLoading) {
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
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 3D Game Scene */}
      <div className="absolute inset-0">
        <Game3DScene mode={mode} userId={userId} gameId={gameId} />
      </div>

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <GameHUD mode={mode} />
      </div>

      {/* Player Counter */}
      <div className="absolute top-4 left-4 z-10">
        <GamePlayerCounter currentPlayers={playerCount} maxPlayers={maxPlayers} mode={mode} />
      </div>

      {/* Game Instructions */}
      <GameInstructions />

      {/* Keyboard Debug */}
      <KeyboardDebug />

      {/* Movement Debug */}
      <MovementDebug />

      {/* Character Debug */}
      <div className="absolute bottom-20 right-4 z-10 bg-black/50 p-2 rounded text-white">
        <div>Character ID: {characterId || "Not loaded"}</div>
      </div>

      {/* Game Controls - for mobile devices */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <GameControls />
      </div>
    </>
  )
}
