"use client"

import { useState, useEffect } from "react"
import { GameScene } from "./game-scene"
import { GameHUD } from "./game-hud"
import { GamePlayerCounter } from "./game-player-counter"
import { GameControls } from "./game-controls"

interface GameViewClientProps {
  mode: string
  gameId: string // Will be used for multiplayer functionality
  userId: string // Will be used for player identification
}

export function GameViewClient({
  mode,
  gameId, // eslint-disable-line @typescript-eslint/no-unused-vars
  userId, // eslint-disable-line @typescript-eslint/no-unused-vars
}: GameViewClientProps) {
  const [selectedCharacter, setSelectedCharacter] = useState("default")
  const [playerCount] = useState(1)
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Load the selected character from localStorage
  useEffect(() => {
    const storedCharacter = localStorage.getItem("selectedCharacter")
    if (storedCharacter) {
      setSelectedCharacter(storedCharacter)
    }

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
  }, [mode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      {/* 3D Game Scene */}
      <div className="absolute inset-0">
        <GameScene mode={mode} characterId={selectedCharacter} />
      </div>

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <GameHUD mode={mode} />
      </div>

      {/* Player Counter */}
      <div className="absolute top-4 left-4 z-10">
        <GamePlayerCounter currentPlayers={playerCount} maxPlayers={maxPlayers} mode={mode} />
      </div>

      {/* Game Controls - for mobile devices */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <GameControls />
      </div>
    </>
  )
}
