"use client"

import { Users } from "lucide-react"

interface GamePlayerCounterProps {
  currentPlayers: number
  maxPlayers: number
  mode: string
}

export function GamePlayerCounter({ currentPlayers, maxPlayers, mode }: GamePlayerCounterProps) {
  // Get the appropriate label based on mode
  const getModeLabel = () => {
    switch (mode) {
      case "solo":
        return "Solo Players"
      case "duo":
        return `Teams: ${Math.ceil(currentPlayers / 2)}/${Math.floor(maxPlayers / 2)}`
      case "trio":
        return `Teams: ${Math.ceil(currentPlayers / 3)}/${Math.floor(maxPlayers / 3)}`
      case "duel":
        return "Duel"
      default:
        return "Players"
    }
  }

  return (
    <div className="bg-black/70 backdrop-blur-sm p-3 rounded-lg text-white">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-purple-400" />
        <div>
          <div className="font-bold">
            {currentPlayers}/{maxPlayers} Players
          </div>
          <div className="text-xs text-gray-300">{getModeLabel()}</div>
        </div>
      </div>
    </div>
  )
}
