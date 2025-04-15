import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const lobbyId = url.searchParams.get("lobbyId")

    if (!lobbyId) {
      return NextResponse.json({ error: "Lobby ID is required" }, { status: 400 })
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

    // Try to get invitations without requiring authentication
    const { data, error } = await supabase
      .from("lobby_invitations")
      .select(`
        id, sender_id, recipient_id, status, lobby_id, created_at,
        sender:profiles!sender_id (username, avatar_url)
      `)
      .eq("lobby_id", lobbyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting invitations:", error)
      return NextResponse.json({ error: "Failed to get invitations" }, { status: 500 })
    }

    return NextResponse.json({ invitations: data || [] })
  } catch (error) {
    console.error("Error in invitations API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
