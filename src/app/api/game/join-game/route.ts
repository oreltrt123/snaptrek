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
    const { userId, gameId, mode, characterId } = body

    // Validate the request
    if (!userId || !gameId || !mode) {
      console.error("Missing required fields:", { userId, gameId, mode })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if player is already in this game
    const { data: existingSession, error: checkError } = await supabaseAdmin
      .from("game_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("instance_id", gameId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing session:", checkError)
      return NextResponse.json({ error: "Failed to check existing session" }, { status: 500 })
    }

    // If player is already in this game, return success
    if (existingSession) {
      return NextResponse.json({
        success: true,
        message: "Player already in game",
        teamId: existingSession.team_id,
      })
    }

    // Assign player to a team
    let teamId = null
    if (mode === "duo" || mode === "trio") {
      const { data: teamData, error: teamError } = await supabaseAdmin.rpc("assign_team", {
        p_user_id: userId,
        p_instance_id: gameId,
        p_mode: mode,
      })

      if (teamError) {
        console.error("Error assigning team:", teamError)
        return NextResponse.json({ error: "Failed to assign team" }, { status: 500 })
      }

      teamId = teamData
    }

    // Register player in this game session
    const { error: insertError } = await supabaseAdmin.from("game_sessions").insert({
      user_id: userId,
      mode: mode,
      instance_id: gameId,
      character_id: characterId || "default",
      team_id: teamId,
      started_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error registering player:", insertError)
      return NextResponse.json({ error: "Failed to register player" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Player joined game",
      teamId: teamId,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
