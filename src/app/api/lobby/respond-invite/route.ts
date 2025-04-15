import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { invitationId, status } = await request.json()

    if (!invitationId || !status) {
      return NextResponse.json({ error: "Invitation ID and status are required" }, { status: 400 })
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'accepted' or 'rejected'" }, { status: 400 })
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

    // Get the invitation
    const { data: invitation, error: getError } = await supabase
      .from("lobby_invitations")
      .select("id, recipient_id, lobby_id")
      .eq("id", invitationId)
      .single()

    if (getError) {
      console.error("Error getting invitation:", getError)
      return NextResponse.json({ error: "Failed to get invitation" }, { status: 500 })
    }

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    // Check if user is the recipient
    if (invitation.recipient_id !== user.id) {
      return NextResponse.json({ error: "You are not the recipient of this invitation" }, { status: 403 })
    }

    // Update invitation status
    const { error: updateError } = await supabase.from("lobby_invitations").update({ status }).eq("id", invitationId)

    if (updateError) {
      console.error("Error updating invitation:", updateError)
      return NextResponse.json({ error: "Failed to update invitation" }, { status: 500 })
    }

    // If accepted, add user to lobby
    if (status === "accepted") {
      // Get the next available position
      const { data: positions, error: posError } = await supabase
        .from("lobby_members")
        .select("position")
        .eq("lobby_id", invitation.lobby_id)
        .order("position", { ascending: false })
        .limit(1)

      const nextPosition = positions && positions.length > 0 ? positions[0].position + 1 : 0

      // Add user to lobby
      const { error: joinError } = await supabase.from("lobby_members").insert({
        lobby_id: invitation.lobby_id,
        user_id: user.id,
        position: nextPosition,
      })

      if (joinError) {
        console.error("Error joining lobby:", joinError)
        return NextResponse.json({ error: "Failed to join lobby" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error("Error in respond-invite API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
