import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get all players in this session
    const { data: players, error } = await supabaseAdmin
      .from("game_sessions")
      .select("user_id, position, character_id, is_moving, direction")
      .eq("session_id", sessionId)
      .eq("active", true)

    if (error) {
      console.error("Error fetching players:", error)
      return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
    }

    // Format player data
    const formattedPlayers = players.map((player) => ({
      id: player.user_id,
      characterId: player.character_id || "default",
      position: player.position || { x: 0, y: 0, z: 0 },
      isMoving: player.is_moving || false,
      direction: player.direction || undefined,
    }))

    return NextResponse.json({ players: formattedPlayers })
  } catch (error) {
    console.error("Error in players endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
