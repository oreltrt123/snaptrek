"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Users, User, UserPlus, Swords } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface GameMode {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  players: string
}

interface GameModeSelectorProps {
  onSelect: (mode: string, id: string) => void
  onClose: () => void
}

export function GameModeSelector({ onSelect, onClose }: GameModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Only mount the component on the client side
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const gameModes: GameMode[] = [
    {
      id: "solo",
      name: "Solo",
      description: "Explore the world alone and complete challenges",
      icon: <User className="h-8 w-8 text-purple-400" />,
      players: "1 Player",
    },
    {
      id: "duo",
      name: "Duo",
      description: "Team up with a friend and battle together",
      icon: <UserPlus className="h-8 w-8 text-cyan-400" />,
      players: "2 Players",
    },
    {
      id: "trio",
      name: "Trio",
      description: "Form a squad of three and dominate the arena",
      icon: <Users className="h-8 w-8 text-purple-400" />,
      players: "3 Players",
    },
    {
      id: "duel",
      name: "Duel",
      description: "One-on-one battle in the center of the arena",
      icon: <Swords className="h-8 w-8 text-cyan-400" />,
      players: "2 Players (PvP)",
    },
  ]

  const handleSelect = (modeId: string) => {
    setSelectedMode(modeId)
  }

  const handleConfirm = () => {
    if (selectedMode) {
      // Generate a unique game session ID
      const gameSessionId = uuidv4()
      onSelect(selectedMode, gameSessionId)
    }
  }

  // Use createPortal to render the dialog in a portal
  // This prevents the dialog from affecting the parent component's rendering
  const dialogContent = (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Select Game Mode</DialogTitle>
          <DialogDescription className="text-gray-300">Choose how you want to play Realm Rivals</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {gameModes.map((mode) => (
            <div
              key={mode.id}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${
                  selectedMode === mode.id
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-700 hover:border-gray-500"
                }
              `}
              onClick={() => handleSelect(mode.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-800 rounded-full">{mode.icon}</div>
                <div>
                  <h3 className="font-bold text-white">{mode.name}</h3>
                  <p className="text-sm text-gray-300">{mode.players}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">{mode.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedMode}
            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            Select Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Only render on the client side
  if (!mounted) return null

  // Use createPortal to render the dialog in a portal
  return createPortal(dialogContent, document.body)
}
