import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", // Use service role key for admin access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function GET(request: Request) {
  try {
    // Get gameId from query parameters
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get("gameId")

    if (!gameId) {
      return NextResponse.json({ error: "Missing gameId parameter" }, { status: 400 })
    }

    // Get all players in this game session with their positions
    const { data: players, error } = await supabaseAdmin
      .from("game_sessions")
      .select(`
        user_id,
        character_id,
        position_x,
        position_y,
        position_z,
        last_position_update
      `)
      .eq("instance_id", gameId)

    if (error) {
      console.error("Error fetching players:", error)
      return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
    }

    // Format the player data
    const formattedPlayers = players.map((player) => ({
      id: player.user_id,
      characterId: player.character_id,
      position: {
        x: player.position_x || 0,
        y: player.position_y || 0,
        z: player.position_z || 0,
      },
      lastUpdated: player.last_position_update ? new Date(player.last_position_update).getTime() : Date.now(),
    }))

    return NextResponse.json({
      success: true,
      players: formattedPlayers,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
