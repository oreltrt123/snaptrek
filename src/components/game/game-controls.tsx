"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from "lucide-react"

export function GameControls() {
  const [showControls, setShowControls] = useState(true)

  // Simulate key press for mobile controls
  const simulateKeyPress = (key: string, pressed: boolean) => {
    const event = new KeyboardEvent(pressed ? "keydown" : "keyup", {
      key,
      code: key,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <div className="p-4">
      {showControls ? (
        <div className="bg-black/70 backdrop-blur-sm p-4 rounded-lg max-w-xs mx-auto">
          <div className="text-center mb-2 text-white text-sm">Controls</div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div></div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onMouseDown={() => simulateKeyPress("KeyW", true)}
              onMouseUp={() => simulateKeyPress("KeyW", false)}
              onTouchStart={() => simulateKeyPress("KeyW", true)}
              onTouchEnd={() => simulateKeyPress("KeyW", false)}
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onMouseDown={() => simulateKeyPress("KeyA", true)}
              onMouseUp={() => simulateKeyPress("KeyA", false)}
              onTouchStart={() => simulateKeyPress("KeyA", true)}
              onTouchEnd={() => simulateKeyPress("KeyA", false)}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onMouseDown={() => simulateKeyPress("KeyS", true)}
              onMouseUp={() => simulateKeyPress("KeyS", false)}
              onTouchStart={() => simulateKeyPress("KeyS", true)}
              onTouchEnd={() => simulateKeyPress("KeyS", false)}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onMouseDown={() => simulateKeyPress("KeyD", true)}
              onMouseUp={() => simulateKeyPress("KeyD", false)}
              onTouchStart={() => simulateKeyPress("KeyD", true)}
              onTouchEnd={() => simulateKeyPress("KeyD", false)}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex justify-center gap-2 mb-2">
            <Button
              variant="outline"
              className="border-purple-500 bg-purple-900/30"
              onMouseDown={() => simulateKeyPress("ShiftLeft", true)}
              onMouseUp={() => simulateKeyPress("ShiftLeft", false)}
              onTouchStart={() => simulateKeyPress("ShiftLeft", true)}
              onTouchEnd={() => simulateKeyPress("ShiftLeft", false)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Sprint (Shift)
            </Button>
          </div>

          <div className="text-center mt-2">
            <button onClick={() => setShowControls(false)} className="text-xs text-gray-400 hover:text-white">
              Hide Controls
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setShowControls(true)}
            className="text-xs text-gray-400 hover:text-white bg-black/50 px-2 py-1 rounded"
          >
            Show Controls
          </button>
        </div>
      )}
    </div>
  )
}
