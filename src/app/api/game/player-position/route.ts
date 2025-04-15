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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, gameId, position } = body

    // Validate the request
    if (!userId || !gameId || !position) {
      console.error("Missing required fields:", { userId, gameId, position })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update player position in the database
    const { error } = await supabaseAdmin.rpc("update_player_position", {
      p_user_id: userId,
      p_instance_id: gameId,
      p_position_x: position.x,
      p_position_y: position.y,
      p_position_z: position.z,
    })

    if (error) {
      console.error("Error updating player position:", error)
      return NextResponse.json({ error: "Failed to update player position" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Player position updated",
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
