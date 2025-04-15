"use client"

import { useState, useEffect, useCallback } from "react"
import { SimpleGameControls } from "./simple-game-controls"

interface SimpleGameViewProps {
  mode: string
}

export function SimpleGameView({ mode }: SimpleGameViewProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [mapSize] = useState({ width: 100, height: 100 })
  const [characterSize] = useState({ width: 40, height: 40 })
  const [characterColor, setCharacterColor] = useState("#a855f7")
  const [mapColor, setMapColor] = useState("#1e1b4b")

  // Set map color based on mode
  useEffect(() => {
    switch (mode) {
      case "solo":
        setMapColor("#1e1b4b") // Deep purple
        setCharacterColor("#a855f7") // Purple
        break
      case "duo":
        setMapColor("#134e4a") // Deep teal
        setCharacterColor("#06b6d4") // Cyan
        break
      case "trio":
        setMapColor("#1e3a8a") // Deep blue
        setCharacterColor("#3b82f6") // Blue
        break
      case "duel":
        setMapColor("#7f1d1d") // Deep red
        setCharacterColor("#ef4444") // Red
        break
      default:
        setMapColor("#1e1b4b")
        setCharacterColor("#a855f7")
    }
  }, [mode])

  // Handle character movement
  const handleMove = useCallback(
    (direction: string) => {
      setPosition((prev) => {
        const speed = 5
        let newX = prev.x
        let newY = prev.y

        switch (direction) {
          case "up":
            newY = Math.max(0, prev.y - speed)
            break
          case "down":
            newY = Math.min(mapSize.height - characterSize.height, prev.y + speed)
            break
          case "left":
            newX = Math.max(0, prev.x - speed)
            break
          case "right":
            newX = Math.min(mapSize.width - characterSize.width, prev.x + speed)
            break
        }

        return { x: newX, y: newY }
      })
    },
    [mapSize, characterSize],
  )

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          handleMove("up")
          break
        case "ArrowDown":
        case "s":
        case "S":
          handleMove("down")
          break
        case "ArrowLeft":
        case "a":
        case "A":
          handleMove("left")
          break
        case "ArrowRight":
        case "d":
        case "D":
          handleMove("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleMove])

  return (
    <div className="w-full h-screen flex items-center justify-center">
      {/* Game Map */}
      <div
        className="relative border-4 border-gray-700 rounded-lg overflow-hidden"
        style={{
          width: `${mapSize.width}%`,
          height: `${mapSize.height}%`,
          maxWidth: "800px",
          maxHeight: "600px",
          backgroundColor: mapColor,
        }}
      >
        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`col-${i}`} className="border-r border-white/10 h-full" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`row-${i}`} className="border-b border-white/10 w-full" />
          ))}
        </div>

        {/* Center Platform */}
        <div
          className="absolute rounded-full"
          style={{
            width: "20%",
            height: "20%",
            left: "40%",
            top: "40%",
            backgroundColor: `${characterColor}50`,
            boxShadow: `0 0 20px ${characterColor}50`,
          }}
        />

        {/* Character */}
        <div
          className="absolute rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-100"
          style={{
            width: `${characterSize.width}px`,
            height: `${characterSize.height}px`,
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: "translate(-50%, -50%)",
            backgroundColor: characterColor,
            boxShadow: `0 0 10px ${characterColor}`,
          }}
        >
          P1
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <SimpleGameControls onMove={handleMove} />
      </div>
    </div>
  )
}
