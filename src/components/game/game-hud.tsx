"use client"

import { useState, useEffect } from "react"
import { Shield, Zap } from "lucide-react"

interface GameHUDProps {
  mode: string
}

export function GameHUD({ mode }: GameHUDProps) {
  const [time, setTime] = useState(0)
  const [health, setHealth] = useState(100)
  const [energy, setEnergy] = useState(100)

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)

    // Simulate energy regeneration
    const energyRegen = setInterval(() => {
      setEnergy((prev) => Math.min(100, prev + 1))
    }, 500)

    return () => {
      clearInterval(timer)
      clearInterval(energyRegen)
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Get mode-specific color
  const getModeColor = () => {
    switch (mode) {
      case "solo":
        return "text-purple-400"
      case "duo":
        return "text-cyan-400"
      case "trio":
        return "text-purple-400"
      case "duel":
        return "text-red-400"
      default:
        return "text-purple-400"
    }
  }

  // Function to simulate damage (to use setHealth)
  const simulateDamage = () => {
    setHealth((prev) => Math.max(0, prev - 10))
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center bg-black/70 backdrop-blur-sm p-3 rounded-lg">
        <div>
          <div className={`font-bold ${getModeColor()}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</div>
          <div className="text-sm text-gray-300">Time: {formatTime(time)}</div>
        </div>

        <div className="flex gap-4">
          {/* Health Bar */}
          <div
            className="flex items-center gap-2"
            onClick={simulateDamage} // Using onClick to use setHealth
          >
            <Shield className="h-4 w-4 text-red-400" />
            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                style={{ width: `${health}%` }}
              ></div>
            </div>
          </div>

          {/* Energy Bar */}
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full"
                style={{ width: `${energy}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
