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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, sessionId, position, isMoving, direction } = body

    if (!userId || !sessionId || !position) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update player position
    const { error } = await supabaseAdmin
      .from("game_sessions")
      .update({
        position,
        updated_at: new Date().toISOString(),
        is_moving: isMoving || false,
        direction: direction || null,
      })
      .eq("user_id", userId)
      .eq("session_id", sessionId)

    if (error) {
      console.error("Error updating player position:", error)
      return NextResponse.json({ error: "Failed to update player position" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in player-position endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
