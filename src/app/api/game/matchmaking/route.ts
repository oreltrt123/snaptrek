import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

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
    const { userId, mode, characterId } = body

    if (!userId || !mode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Find an available game session for the selected mode
    const { data: availableSessions, error: sessionsError } = await supabaseAdmin
      .from("game_instances")
      .select("id, player_count")
      .eq("mode", mode)
      .eq("status", "active")
      .lt("player_count", 10) // Max 10 players per session
      .order("created_at", { ascending: true })
      .limit(1)

    if (sessionsError) {
      console.error("Error finding available sessions:", sessionsError)
      return NextResponse.json({ error: "Failed to find available sessions" }, { status: 500 })
    }

    let gameSessionId

    // If no available session, create a new one
    if (!availableSessions || availableSessions.length === 0) {
      const newId = uuidv4()
      const { data: newSession, error: createError } = await supabaseAdmin
        .from("game_instances")
        .insert({
          id: newId,
          mode,
          status: "active",
          player_count: 1,
          created_at: new Date().toISOString(),
        })
        .select()

      if (createError) {
        console.error("Error creating new session:", createError)
        return NextResponse.json({ error: "Failed to create new game session" }, { status: 500 })
      }

      gameSessionId = newId
    } else {
      // Use existing session
      gameSessionId = availableSessions[0].id

      // Update player count
      const newPlayerCount = availableSessions[0].player_count + 1

      // Update the session's player count
      const { error: updateError } = await supabaseAdmin
        .from("game_instances")
        .update({
          player_count: newPlayerCount,
          status: newPlayerCount >= 10 ? "full" : "active",
        })
        .eq("id", gameSessionId)

      if (updateError) {
        console.error("Error updating session player count:", updateError)
        return NextResponse.json({ error: "Failed to update game session" }, { status: 500 })
      }
    }

    // Return the game session ID
    return NextResponse.json({
      success: true,
      data: {
        gameSessionId,
        mode,
      },
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
