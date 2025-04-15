"use client"

import { useState, useEffect } from "react"

export function KeyboardDebug() {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.code]: true }))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.code]: false }))
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="absolute top-20 right-4 z-20 bg-black/50 p-2 rounded-lg text-white hover:bg-black/70 text-xs"
      >
        Show Debug
      </button>
    )
  }

  return (
    <div className="absolute top-20 right-4 z-20 bg-black/70 p-3 rounded-lg text-white text-xs">
      <div className="flex justify-between mb-2">
        <h3>Keyboard Debug</h3>
        <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      <div className="space-y-1">
        <div>W: {keys["KeyW"] ? "Pressed" : "Released"}</div>
        <div>A: {keys["KeyA"] ? "Pressed" : "Released"}</div>
        <div>S: {keys["KeyS"] ? "Pressed" : "Released"}</div>
        <div>D: {keys["KeyD"] ? "Pressed" : "Released"}</div>
        <div>Shift: {keys["ShiftLeft"] ? "Pressed" : "Released"}</div>
        <div>Up: {keys["ArrowUp"] ? "Pressed" : "Released"}</div>
        <div>Left: {keys["ArrowLeft"] ? "Pressed" : "Released"}</div>
        <div>Down: {keys["ArrowDown"] ? "Pressed" : "Released"}</div>
        <div>Right: {keys["ArrowRight"] ? "Pressed" : "Released"}</div>
      </div>
    </div>
  )
}
