import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

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

    // Get invitations with sender details
    const { data: invitations, error } = await supabase
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

    if (error) {
      console.error("Error fetching invitations:", error)
      return NextResponse.json(
        { success: false, message: "Failed to fetch invitations", error: error.message },
        { status: 500 }
      )
    }

    // Format the invitations to include sender details
    const formattedInvitations = invitations.map(invitation => ({
      id: invitation.id,
      sender_id: invitation.sender_id,
      recipient_id: invitation.recipient_id,
      lobby_id: invitation.lobby_id,
      status: invitation.status,
      created_at: invitation.created_at,
      sender_username: invitation.sender?.username,
      sender_avatar: invitation.sender?.avatar_url
    }))

    return NextResponse.json({
      success: true,
      invitations: formattedInvitations
    })
  } catch (error) {
    console.error("Error in invitations API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}