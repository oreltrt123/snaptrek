"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, RefreshCw } from "lucide-react"

interface GameMatchmakingProps {
  mode: string
  userId: string
  onJoinGame: (gameId: string) => void
}

export function GameMatchmaking({ mode, userId, onJoinGame }: GameMatchmakingProps) {
  const [status, setStatus] = useState<"idle" | "searching" | "joining">("idle")
  const [availableGames, setAvailableGames] = useState<{ id: string; players: number; maxPlayers: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState(0)

  // Get max players based on mode
  const getMaxPlayers = () => {
    switch (mode) {
      case "solo":
        return 10
      case "duo":
        return 10
      case "trio":
        return 12
      case "duel":
        return 2
      default:
        return 10
    }
  }

  // Find available games
  useEffect(() => {
    if (status !== "searching") return

    const fetchAvailableGames = async () => {
      try {
        // This would be a real API call to your Supabase backend
        // For now, we'll simulate it
        console.log(`Searching for ${mode} games...`)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate available games
        const maxPlayers = getMaxPlayers()
        const simulatedGames = []

        // Generate 0-3 available games
        const gameCount = Math.floor(Math.random() * 4)
        for (let i = 0; i < gameCount; i++) {
          const playerCount = Math.floor(Math.random() * (maxPlayers - 1)) + 1
          simulatedGames.push({
            id: `game-${mode}-${i}`,
            players: playerCount,
            maxPlayers,
          })
        }

        setAvailableGames(simulatedGames)

        // If no games available and we've been searching for a while, create a new one
        if (simulatedGames.length === 0 && searchTime > 5) {
          createNewGame()
        }
      } catch (err) {
        console.error("Error fetching available games:", err)
        setError("Failed to find games. Please try again.")
        setStatus("idle")
      }
    }

    const interval = setInterval(fetchAvailableGames, 2000)
    const timer = setInterval(() => setSearchTime((prev) => prev + 1), 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [status, mode, searchTime])

  // Start searching for games
  const startMatchmaking = () => {
    setStatus("searching")
    setSearchTime(0)
    setError(null)
  }

  // Cancel matchmaking
  const cancelMatchmaking = () => {
    setStatus("idle")
    setAvailableGames([])
  }

  // Join an existing game
  const joinGame = (gameId: string) => {
    setStatus("joining")

    // Simulate joining a game
    setTimeout(() => {
      onJoinGame(gameId)
    }, 1500)
  }

  // Create a new game
  const createNewGame = () => {
    setStatus("joining")

    // Simulate creating a new game
    setTimeout(() => {
      const newGameId = `game-${mode}-${Date.now()}`
      onJoinGame(newGameId)
    }, 1500)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">
          {status === "idle" ? "Find a Match" : status === "searching" ? "Searching..." : "Joining Game..."}
        </CardTitle>
        <CardDescription>
          {status === "idle"
            ? `Find other players in ${mode} mode`
            : status === "searching"
              ? `Looking for available ${mode} games`
              : "Preparing to join game..."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              Click the button below to start matchmaking for {mode} mode
            </p>
          </div>
        )}

        {status === "searching" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Search time: {searchTime}s</span>
              <Button variant="ghost" size="sm" onClick={() => setAvailableGames([])}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>

            {availableGames.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Games:</p>
                {availableGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => joinGame(game.id)}
                  >
                    <div>
                      <p className="font-medium">{game.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {game.players} / {game.maxPlayers} players
                      </p>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <p className="text-center text-muted-foreground">Searching for available games...</p>
                {searchTime > 5 && (
                  <Button variant="outline" className="mt-4" onClick={createNewGame}>
                    Create New Game
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {status === "joining" && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-center">Joining game... Please wait</p>
          </div>
        )}

        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mt-4">{error}</div>}
      </CardContent>

      <CardFooter className="flex justify-between">
        {status === "idle" ? (
          <Button className="w-full" onClick={startMatchmaking}>
            Start Matchmaking
          </Button>
        ) : status === "searching" ? (
          <Button variant="outline" className="w-full" onClick={cancelMatchmaking}>
            Cancel
          </Button>
        ) : (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Joining...
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
