// Update the GameView component to use the client component

"use client"

import { GameViewClient } from "./game-view-client"

interface GameViewProps {
  mode: string
  gameId: string
  userId: string
}

export function GameView({ mode, gameId, userId }: GameViewProps) {
  return <GameViewClient mode={mode} gameId={gameId} userId={userId} />
}
