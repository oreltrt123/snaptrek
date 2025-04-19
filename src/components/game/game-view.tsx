"use client"

import { useState, useEffect } from "react"
import { GameHUD } from "./game-hud"
import { GamePlayerCounter } from "./game-player-counter"
import { GameControls } from "./game-controls"
import { GameInstructions } from "./game-instructions"
import { KeyboardDebug } from "./keyboard-debug"
import { MovementDebug } from "./movement-debug"
import { InventoryDisplay } from "./inventory-display"
import { createClient } from "@supabase/supabase-js"
import dynamic from "next/dynamic"

// Create Supabase client directly in this file to avoid schema cache issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Disable schema cache to avoid issues
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-disable-cache": "true",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Dynamically import the 3D game scene to avoid SSR issues
const Game3DScene = dynamic(() => import("./game-3d-scene"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

interface GameViewProps {
  mode: string
  gameId: string
  userId: string
}

export function GameView({ mode, gameId, userId }: GameViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playerCount, setPlayerCount] = useState(1)
  const [maxPlayers, setMaxPlayers] = useState(10)
  const [isMobile, setIsMobile] = useState(false)
  const [characterId, setCharacterId] = useState<string | null>(null)
  const [inventory, setInventory] = useState<{ weapons: string[]; items: string[] }>({ weapons: [], items: [] })
  const [otherPlayers, setOtherPlayers] = useState<any[]>([])
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    console.log("GameView - Mode:", mode, "Game ID:", gameId, "User ID:", userId)

    // Try to get the character ID from localStorage
    const savedCharacter = localStorage.getItem("selectedCharacter")
    if (savedCharacter) {
      console.log("Found character in localStorage:", savedCharacter)
      setCharacterId(savedCharacter)
    } else {
      // Default to a character if none is selected
      setCharacterId("char8")
      localStorage.setItem("selectedCharacter", "char8")
    }

    // Check if device is mobile
    setIsMobile(window.innerWidth < 768)

    // Set max players based on mode
    switch (mode) {
      case "solo":
        setMaxPlayers(10)
        break
      case "duo":
        setMaxPlayers(10) // 5 teams of 2
        break
      case "trio":
        setMaxPlayers(12) // 4 teams of 3
        break
      case "duel":
        setMaxPlayers(2) // 1v1
        break
      default:
        setMaxPlayers(10)
    }

    // Connect to game session and get player count
    const connectToGameSession = async () => {
      try {
        setDebugInfo("Connecting to game session...")

        // First, try to create the game session using raw SQL to bypass schema cache
        try {
          // Check if game exists using raw SQL
          const { data: gameExists, error: gameCheckError } = await supabase.rpc("game_exists", {
            p_game_id: gameId,
          })

          if (gameCheckError) {
            console.log("RPC game_exists failed, trying direct SQL:", gameCheckError)

            // Try direct SQL as fallback
            const { data: gameData } = await supabase.from("game_sessions").select("id").eq("id", gameId).maybeSingle()

            if (!gameData) {
              setDebugInfo("Game doesn't exist, creating with direct SQL...")

              // Create game using direct SQL
              await supabase.rpc("create_game", {
                p_game_id: gameId,
                p_mode: mode,
                p_max_players: maxPlayers,
              })
            }
          } else if (!gameExists) {
            setDebugInfo("Game doesn't exist, creating with RPC...")

            // Create game using RPC
            await supabase.rpc("create_game", {
              p_game_id: gameId,
              p_mode: mode,
              p_max_players: maxPlayers,
            })
          }
        } catch (sqlError) {
          console.error("SQL/RPC error:", sqlError)
          setDebugInfo(`SQL/RPC error: ${sqlError}. Trying direct insert...`)

          // Last resort: Try direct insert with minimal fields
          try {
            // Try to create game with direct insert
            await supabase.from("game_sessions").insert({
              id: gameId,
              mode: mode,
              max_players: maxPlayers,
              current_players: 1,
              status: "in_progress",
            })
          } catch (insertError) {
            console.error("Insert error:", insertError)
            setDebugInfo(`Insert error: ${insertError}. Using raw SQL...`)

            // Final attempt: Use raw SQL
            try {
              await supabase.rpc("execute_sql", {
                sql: `
                  INSERT INTO game_sessions (id, mode, max_players, current_players, status)
                  VALUES ('${gameId}', '${mode}', ${maxPlayers}, 1, 'in_progress')
                  ON CONFLICT (id) DO NOTHING
                `,
              })
            } catch (rawSqlError) {
              console.error("Raw SQL error:", rawSqlError)
              setDebugInfo(`Raw SQL error: ${rawSqlError}. Continuing anyway...`)
              // Continue anyway, the game might already exist
            }
          }
        }

        // Now try to add the player to the game
        try {
          // Check if player exists
          const { data: existingPlayer } = await supabase
            .from("game_players")
            .select("id")
            .eq("game_id", gameId)
            .eq("user_id", userId)
            .maybeSingle()

          if (!existingPlayer) {
            setDebugInfo("Adding player to game...")
            const characterToUse = savedCharacter || "char8"

            // Generate random starting position
            const randomX = (Math.random() - 0.5) * 6
            const randomZ = (Math.random() - 0.5) * 6

            // Try to add player with RPC
            try {
              await supabase.rpc("add_player", {
                p_user_id: userId,
                p_game_id: gameId,
                p_character_id: characterToUse,
                p_position_x: randomX,
                p_position_y: 0,
                p_position_z: randomZ,
              })
            } catch (rpcError) {
              console.error("RPC add_player error:", rpcError)
              setDebugInfo(`RPC add_player error: ${rpcError}. Trying direct insert...`)

              // Try direct insert
              try {
                await supabase.from("game_players").insert({
                  user_id: userId,
                  game_id: gameId,
                  character_id: characterToUse,
                  position_x: randomX,
                  position_y: 0,
                  position_z: randomZ,
                  is_moving: false,
                  health: 100,
                  inventory: JSON.stringify({ weapons: [], items: [] }),
                })
              } catch (insertError) {
                console.error("Player insert error:", insertError)
                setDebugInfo(`Player insert error: ${insertError}. Using raw SQL...`)

                // Final attempt: Use raw SQL
                try {
                  await supabase.rpc("execute_sql", {
                    sql: `
                      INSERT INTO game_players (user_id, game_id, character_id, position_x, position_y, position_z, is_moving, health, inventory)
                      VALUES ('${userId}', '${gameId}', '${characterToUse}', ${randomX}, 0, ${randomZ}, false, 100, '{"weapons":[],"items":[]}')
                      ON CONFLICT (user_id, game_id) DO NOTHING
                    `,
                  })
                } catch (rawSqlError) {
                  console.error("Raw SQL player error:", rawSqlError)
                  setDebugInfo(`Raw SQL player error: ${rawSqlError}`)
                }
              }
            }
          }
        } catch (playerError) {
          console.error("Player check error:", playerError)
          setDebugInfo(`Player check error: ${playerError}`)
        }

        // Get all players in the game
        try {
          const { data: players, error: playersError } = await supabase
            .from("game_players")
            .select("*")
            .eq("game_id", gameId)

          if (playersError) {
            console.error("Error fetching players:", playersError)
            setDebugInfo(`Error fetching players: ${playersError.message}`)
          } else if (players) {
            setPlayerCount(players.length)
            setDebugInfo(`Found ${players.length} players in game`)

            // Filter out current player
            const others = players.filter((p) => p.user_id !== userId)
            console.log("Other players:", others)
            setOtherPlayers(others)
          }
        } catch (fetchError) {
          console.error("Player fetch error:", fetchError)
          setDebugInfo(`Player fetch error: ${fetchError}`)
        }

        setIsLoading(false)
      } catch (err: any) {
        console.error("Failed to connect to game session:", err)
        setDebugInfo(`Unexpected error: ${err.message || JSON.stringify(err)}`)
        setError(`Failed to connect to game session: ${err.message || "Unknown error"}`)
        setIsLoading(false)
      }
    }

    connectToGameSession()

    // Set up real-time listener for player updates
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log("Game player update:", payload)
          setDebugInfo(`Player update received: ${payload.eventType}`)

          // Refresh player list when there's a change
          supabase
            .from("game_players")
            .select("*")
            .eq("game_id", gameId)
            .then(({ data, error }) => {
              if (error) {
                console.error("Error fetching updated players:", error)
                setDebugInfo(`Error fetching updated players: ${error.message}`)
              } else if (data) {
                setPlayerCount(data.length)
                setDebugInfo(`Updated player count: ${data.length}`)

                // Filter out the current player
                const others = data.filter((player) => player.user_id !== userId)
                console.log("Updated other players:", others)
                setOtherPlayers(others)
              }
            })
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
        setDebugInfo(`Subscription status: ${JSON.stringify(status)}`)
      })

    // Periodically refresh player list to catch any missed updates
    const refreshInterval = setInterval(() => {
      supabase
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error in periodic refresh:", error)
          } else if (data) {
            setPlayerCount(data.length)
            // Filter out the current player
            const others = data.filter((player) => player.user_id !== userId)
            setOtherPlayers(others)
          }
        })
    }, 5000) // Refresh every 5 seconds

    // Clean up on unmount
    return () => {
      gameChannel.unsubscribe()
      clearInterval(refreshInterval)

      // When player leaves, update the player count
      const leaveGame = async () => {
        try {
          // Remove player from game
          await supabase.from("game_players").delete().eq("game_id", gameId).eq("user_id", userId)
        } catch (err) {
          console.error("Error leaving game:", err)
        }
      }

      leaveGame()
    }
  }, [mode, gameId, userId])

  // Function to update inventory when items are picked up
  const handleInventoryUpdate = (newInventory: { weapons: string[]; items: string[] }) => {
    setInventory(newInventory)

    // Update inventory in database
    supabase
      .from("game_players")
      .update({ inventory: JSON.stringify(newInventory) })
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating inventory:", error)
        }
      })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-center max-w-md">
          <p className="mb-2">Loading game session...</p>
          <p className="text-sm opacity-70">{debugInfo}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error}</p>
          <div className="text-sm opacity-80 mt-4">
            <p>Debug Info:</p>
            <pre className="bg-black/30 p-2 rounded mt-2 overflow-auto max-h-40">{debugInfo}</pre>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 3D Game Scene */}
      <div className="absolute inset-0">
        <Game3DScene
          mode={mode}
          userId={userId}
          gameId={gameId}
          onInventoryUpdate={handleInventoryUpdate}
          otherPlayers={otherPlayers}
          characterId={characterId || "char8"}
        />
      </div>

      {/* Game HUD */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <GameHUD mode={mode} />
      </div>

      {/* Player Counter */}
      <div className="absolute top-4 left-4 z-10">
        <GamePlayerCounter currentPlayers={playerCount} maxPlayers={maxPlayers} mode={mode} />
      </div>

      {/* Inventory Display */}
      <div className="absolute bottom-20 right-4 z-10">
        <InventoryDisplay inventory={inventory} />
      </div>

      {/* Game Instructions */}
      <GameInstructions />

      {/* Keyboard Debug */}
      <KeyboardDebug />

      {/* Movement Debug */}
      <MovementDebug />

      {/* Game Controls - for mobile devices */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <GameControls />
      </div>

      {/* Debug Info */}
      <div className="absolute bottom-4 left-4 z-20 bg-black/70 text-white p-2 rounded text-xs max-w-xs">
        <div>Game ID: {gameId.substring(0, 8)}...</div>
        <div>Players: {playerCount}</div>
        <div>Other Players: {otherPlayers.length}</div>
        <div className="text-xs opacity-70 mt-1">{debugInfo}</div>
      </div>
    </>
  )
}
