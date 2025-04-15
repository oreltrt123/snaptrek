"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from "lucide-react"
import { useState } from "react"

interface SimpleGameControlsProps {
  onMove: (direction: string) => void
}

export function SimpleGameControls({ onMove }: SimpleGameControlsProps) {
  const [showControls, setShowControls] = useState(true)

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
              onClick={() => onMove("up")}
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
            <div></div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onClick={() => onMove("left")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onClick={() => onMove("down")}
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-gray-500 bg-gray-800/50"
              onClick={() => onMove("right")}
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex justify-center gap-2 mb-2">
            <Button variant="outline" className="border-purple-500 bg-purple-900/30">
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
