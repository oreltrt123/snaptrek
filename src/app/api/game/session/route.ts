import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // Get the session ID from the query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "Session ID is required" }, { status: 400 })
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
        { success: false, message: "You must be logged in to access game sessions" },
        { status: 401 },
      )
    }

    // Get the game session
    const { data: gameSession, error } = await supabase.from("game_sessions").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json(
        { success: false, message: "Game session not found", details: error.message },
        { status: 404 },
      )
    }

    // Get the players in the session
    const { data: players, error: playersError } = await supabase
      .from("game_session_players")
      .select("*, profiles:user_id(username, avatar_url)")
      .eq("session_id", id)

    if (playersError) {
      console.error("Error fetching players:", playersError)
    }

    return NextResponse.json({
      success: true,
      data: {
        session: gameSession,
        players: players || [],
      },
    })
  } catch (error) {
    console.error("Error in session API:", error)
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
