import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const gameId = searchParams.get("gameId")
    const userId = searchParams.get("userId")

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 })
    }

    // Create a Supabase client for server-side operations
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name, options) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 })
          },
        },
      },
    )

    // Get all players in the game except the current user
    const query = supabase
      .from("game_players")
      .select(
        "user_id, position_x, position_y, position_z, character_id, is_moving, direction_x, direction_y, direction_z, last_updated",
      )
      .eq("game_id", gameId)

    // If userId is provided, exclude the current user
    if (userId) {
      query.neq("user_id", userId)
    }

    const { data: players, error } = await query

    if (error) {
      console.error("Error fetching players:", error)
      return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
    }

    // Format the players data
    const formattedPlayers = players.map((player) => ({
      userId: player.user_id,
      position: {
        x: player.position_x,
        y: player.position_y,
        z: player.position_z,
      },
      characterId: player.character_id || "default",
      isMoving: player.is_moving || false,
      direction: {
        x: player.direction_x || 0,
        y: player.direction_y || 0,
        z: player.direction_z || 0,
      },
      lastUpdated: player.last_updated,
    }))

    return NextResponse.json({ players: formattedPlayers })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
