"use client"

import { useState, useEffect } from "react"

export function MovementDebug() {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotation] = useState(0)
  const [moving, setMoving] = useState(false)
  const [lastMoveTime, setLastMoveTime] = useState(0)

  useEffect(() => {
    // Listen for character movement events
    const handleCharacterMoved = (event: CustomEvent) => {
      const { position, rotation } = event.detail
      setPosition({ x: position.x, y: position.y, z: position.z })
      setRotation(rotation)
      setMoving(true)
      setLastMoveTime(Date.now())
    }

    // Check if character has stopped moving
    const checkMovement = () => {
      if (moving && Date.now() - lastMoveTime > 200) {
        setMoving(false)
      }
    }

    // Add event listener
    window.addEventListener("character-moved", handleCharacterMoved as EventListener)

    // Set up interval to check if character has stopped moving
    const interval = setInterval(checkMovement, 250)

    // Toggle debug panel with ~ key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`" || e.key === "~") {
        setVisible((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("character-moved", handleCharacterMoved as EventListener)
      window.removeEventListener("keydown", handleKeyDown)
      clearInterval(interval)
    }
  }, [moving, lastMoveTime])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 w-64">
      <div className="flex justify-between mb-2">
        <span>Movement Debug</span>
        <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1">
        <span>Position:</span>
        <span>
          X: {position.x.toFixed(2)}, Y: {position.y.toFixed(2)}, Z: {position.z.toFixed(2)}
        </span>

        <span>Rotation:</span>
        <span>{(rotation * (180 / Math.PI)).toFixed(2)}°</span>

        <span>Status:</span>
        <span className={moving ? "text-green-400" : "text-red-400"}>{moving ? "Moving" : "Idle"}</span>
      </div>

      <div className="mt-2 text-gray-400 text-[10px]">Press ~ to toggle this panel</div>
    </div>
  )
}
