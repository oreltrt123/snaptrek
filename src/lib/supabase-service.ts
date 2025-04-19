import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Initialize Supabase client with the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Log the Supabase URL and key (first few characters) for debugging
console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key (first 5 chars):", supabaseAnonKey.substring(0, 5))

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Test the connection
supabase
  .from("game_sessions")
  .select("count(*)")
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection test failed:", error)
    } else {
      console.log("Supabase connection test successful:", data)
    }
  })

// Game session types
export interface GameSession {
  id: string
  mode: string
  max_players: number
  current_players: number
  created_at: string
  status: "waiting" | "in_progress" | "completed"
}

export interface GamePlayer {
  id: string
  user_id: string
  game_id: string
  character_id: string
  position_x: number
  position_y: number
  position_z: number
  is_moving: boolean
  is_sprinting?: boolean
  is_jumping?: boolean
  direction_x?: number
  direction_y?: number
  direction_z?: number
  health: number
  team?: string
  inventory: string // JSON string of inventory
  joined_at: string
}

// Game service functions
export const gameService = {
  // Find available game sessions
  async findAvailableGames(mode: string): Promise<GameSession[]> {
    const { data, error } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("mode", mode)
      .eq("status", "waiting")
      .lt("current_players", "max_players")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error finding available games:", error)
      return []
    }

    return data || []
  },

  // Create a new game session
  async createGameSession(mode: string): Promise<GameSession | null> {
    // Determine max players based on mode
    let maxPlayers = 10
    switch (mode) {
      case "solo":
        maxPlayers = 10
        break
      case "duo":
        maxPlayers = 10
        break
      case "trio":
        maxPlayers = 12
        break
      case "duel":
        maxPlayers = 2
        break
    }

    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        mode,
        max_players: maxPlayers,
        current_players: 0,
        status: "waiting",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating game session:", error)
      return null
    }

    return data
  },

  // Join a game session
  async joinGameSession(gameId: string, userId: string, characterId: string): Promise<boolean> {
    // First, check if the game is still available
    const { data: game, error: gameError } = await supabase.from("game_sessions").select("*").eq("id", gameId).single()

    if (gameError || !game || game.status !== "waiting" || game.current_players >= game.max_players) {
      console.error("Game is not available to join")
      return false
    }

    // Start a transaction to join the game
    const { error: playerError } = await supabase.from("game_players").insert({
      user_id: userId,
      game_id: gameId,
      character_id: characterId,
      position_x: 0,
      position_y: 0,
      position_z: 0,
      is_moving: false,
      health: 100,
      inventory: JSON.stringify({ weapons: [], items: [] }),
    })

    if (playerError) {
      console.error("Error joining game:", playerError)
      return false
    }

    // Update player count
    const { error: updateError } = await supabase
      .from("game_sessions")
      .update({ current_players: game.current_players + 1 })
      .eq("id", gameId)

    if (updateError) {
      console.error("Error updating player count:", updateError)
      // We should handle this better in a real app
      return false
    }

    return true
  },

  // Update player position
  async updatePlayerPosition(
    gameId: string,
    userId: string,
    position: { x: number; y: number; z: number },
    isMoving: boolean,
    isSprinting?: boolean,
    isJumping?: boolean,
    direction?: { x: number; y: number; z: number },
  ): Promise<boolean> {
    const { error } = await supabase
      .from("game_players")
      .update({
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        is_moving: isMoving,
        is_sprinting: isSprinting,
        is_jumping: isJumping,
        direction_x: direction?.x,
        direction_y: direction?.y,
        direction_z: direction?.z,
      })
      .eq("game_id", gameId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating player position:", error)
      return false
    }

    return true
  },

  // Update player inventory
  async updatePlayerInventory(
    gameId: string,
    userId: string,
    inventory: { weapons: string[]; items: string[] },
  ): Promise<boolean> {
    const { error } = await supabase
      .from("game_players")
      .update({
        inventory: JSON.stringify(inventory),
      })
      .eq("game_id", gameId)
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating player inventory:", error)
      return false
    }

    return true
  },

  // Get all players in a game
  async getGamePlayers(gameId: string): Promise<GamePlayer[]> {
    const { data, error } = await supabase.from("game_players").select("*").eq("game_id", gameId)

    if (error) {
      console.error("Error getting game players:", error)
      return []
    }

    return data || []
  },
}
