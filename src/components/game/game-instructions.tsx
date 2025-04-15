"use client"

import { useState, useEffect } from "react"
import { Keyboard, MousePointer, Info } from "lucide-react"

export function GameInstructions() {
  const [show, setShow] = useState(true)

  // Auto-hide instructions after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="absolute bottom-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white hover:bg-black/70"
      >
        <Info className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="absolute bottom-20 right-4 z-20 bg-black/70 backdrop-blur-sm p-4 rounded-lg max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-white">Game Controls</h3>
        <button onClick={() => setShow(false)} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-purple-400" />
          <span>
            <strong>WASD</strong> or <strong>Arrow Keys</strong> to move
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-purple-400" />
          <span>
            <strong>Shift</strong> to sprint
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-purple-400" />
          <span>
            <strong>Mouse</strong> to look around
          </span>
        </div>
      </div>
    </div>
  )
}
