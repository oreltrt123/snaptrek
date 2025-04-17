import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { sessionId, mode, players, createdBy } = await request.json()

    // Validate required fields
    if (!sessionId || !mode) {
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

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, message: "You must be logged in to create a game session" },
        { status: 401 },
      )
    }

    // Create the game session
    const { data, error } = await supabase
      .from("game_sessions")
      .insert({
        id: sessionId,
        mode,
        status: "active",
        created_by: createdBy || session.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating game session:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create game session", details: error.message },
        { status: 500 },
      )
    }

    // Add players to the game session
    if (players && players.length > 0) {
      const playerEntries = players.map((playerId: string) => ({
        session_id: sessionId,
        user_id: playerId,
        joined_at: new Date().toISOString(),
        status: "active",
      }))

      const { error: playersError } = await supabase.from("game_session_players").insert(playerEntries)

      if (playersError) {
        console.error("Error adding players to session:", playersError)
        // Continue even if adding players fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Game session created successfully",
      data: { sessionId },
    })
  } catch (error) {
    console.error("Error in create-session API:", error)
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
