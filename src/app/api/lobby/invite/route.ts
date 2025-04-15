import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { userId, lobbyId } = await request.json()

    if (!userId || !lobbyId) {
      return NextResponse.json({ error: "User ID and Lobby ID are required" }, { status: 400 })
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

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if invitation already exists
    const { data: existingInvite, error: checkError } = await supabase
      .from("lobby_invitations")
      .select("id, status")
      .eq("sender_id", user.id)
      .eq("recipient_id", userId)
      .eq("lobby_id", lobbyId)
      .eq("status", "pending")
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing invitation:", checkError)
      return NextResponse.json({ error: "Failed to check existing invitation" }, { status: 500 })
    }

    if (existingInvite) {
      return NextResponse.json({
        message: "Invitation already sent",
        invitationId: existingInvite.id,
      })
    }

    // Create invitation
    const { data, error } = await supabase
      .from("lobby_invitations")
      .insert({
        sender_id: user.id,
        recipient_id: userId,
        lobby_id: lobbyId,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating invitation:", error)
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invitationId: data.id,
      message: "Invitation sent successfully",
    })
  } catch (error) {
    console.error("Error in invite API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
