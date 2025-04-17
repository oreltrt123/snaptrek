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

    // Count players in this game session
    const { count, error } = await supabaseAdmin
      .from("game_sessions")
      .select("*", { count: "exact", head: true })
      .eq("instance_id", gameId)

    if (error) {
      console.error("Error counting players:", error)
      return NextResponse.json({ error: "Failed to count players" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
