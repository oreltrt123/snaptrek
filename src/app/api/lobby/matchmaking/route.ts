import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { mode, userId } = await request.json()

    if (!mode || !userId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
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

    // Find an available game session for the selected mode
    const { data: availableSessions, error: sessionsError } = await supabase
      .from("game_sessions")
      .select("id, player_count")
      .eq("mode", mode)
      .eq("status", "waiting")
      .lt("player_count", 10) // Max 10 players per session for solo mode
      .order("created_at", { ascending: true })
      .limit(1)

    if (sessionsError) {
      console.error("Error finding available sessions:", sessionsError)
      return NextResponse.json({ success: false, message: "Failed to find available sessions" }, { status: 500 })
    }

    let gameSessionId

    // If no available session, create a new one
    if (!availableSessions || availableSessions.length === 0) {
      const { data: newSession, error: createError } = await supabase
        .from("game_sessions")
        .insert({
          mode,
          status: "waiting",
          player_count: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (createError) {
        console.error("Error creating new session:", createError)
        return NextResponse.json({ success: false, message: "Failed to create new game session" }, { status: 500 })
      }

      gameSessionId = newSession[0].id
    } else {
      // Use existing session
      gameSessionId = availableSessions[0].id

      // Update player count
      const newPlayerCount = availableSessions[0].player_count + 1

      // Update the session's player count
      const { error: updateError } = await supabase
        .from("game_sessions")
        .update({
          player_count: newPlayerCount,
          status: newPlayerCount >= 10 ? "full" : "waiting",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameSessionId)

      if (updateError) {
        console.error("Error updating session player count:", updateError)
        return NextResponse.json({ success: false, message: "Failed to update game session" }, { status: 500 })
      }
    }

    // Add player to the game session
    const { error: playerError } = await supabase.from("game_session_players").insert({
      session_id: gameSessionId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      status: "ready",
    })

    if (playerError) {
      console.error("Error adding player to session:", playerError)
      return NextResponse.json({ success: false, message: "Failed to add player to game session" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Joined game session successfully",
      data: {
        gameSessionId,
      },
    })
  } catch (error) {
    console.error("Error in matchmaking API:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
