import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    const lobbyId = url.searchParams.get("lobbyId")

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Missing required parameter: userId" },
        { status: 400 }
      )
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
      }
    )

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single()

    // Get pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from("lobby_invitations")
      .select(`
        *,
        sender:sender_id (
          username,
          avatar_url
        )
      `)
      .eq("recipient_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    // Get all invitations (not just pending)
    const { data: allInvitations, error: allInvitationsError } = await supabase
      .from("lobby_invitations")
      .select(`
        *,
        sender:sender_id (
          username,
          avatar_url
        )
      `)
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    // If lobby ID is provided, check for specific invitations
    let lobbyInvitations = null
    if (lobbyId) {
      const { data, error } = await supabase
        .from("lobby_invitations")
        .select(`
          *,
          sender:sender_id (
            username,
            avatar_url
          )
        `)
        .eq("recipient_id", userId)
        .eq("lobby_id", lobbyId)
        .order("created_at", { ascending: false })

      if (!error) {
        lobbyInvitations = data
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      username: profile?.username || "Unknown",
      pendingInvitations: invitations || [],
      allInvitations: allInvitations || [],
      lobbyInvitations,
      errors: {
        profile: profileError?.message,
        invitations: invitationsError?.message,
        allInvitations: allInvitationsError?.message
      }
    })
  } catch (error) {
    console.error("Error in direct-check-invites API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}