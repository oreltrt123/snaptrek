import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { invitationId, accept, position } = await request.json()

    // Validate required fields
    if (!invitationId) {
      return NextResponse.json(
        { success: false, message: "Missing required field: invitationId" },
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

    // Get the invitation details first
    const { data: invitation, error: getError } = await supabase
      .from("lobby_invitations")
      .select("*")
      .eq("id", invitationId)
      .single()

    if (getError) {
      console.error("Error getting invitation:", getError)
      return NextResponse.json(
        { success: false, message: "Failed to get invitation details" },
        { status: 500 }
      )
    }

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: "Invitation not found" },
        { status: 404 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("lobby_invitations")
      .update({
        status: accept ? "accepted" : "declined",
        updated_at: new Date().toISOString()
      })
      .eq("id", invitationId)

    if (updateError) {
      console.error("Error updating invitation:", updateError)
      return NextResponse.json(
        { success: false, message: "Failed to update invitation status" },
        { status: 500 }
      )
    }

    // If accepted, add to lobby members
    if (accept) {
      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from("lobby_members")
        .select("*")
        .eq("lobby_id", invitation.lobby_id)
        .eq("user_id", invitation.recipient_id)
        .single()

      if (checkError && checkError.code !== "PGRST116") { // PGRST116 is "no rows returned" which is expected
        console.error("Error checking existing member:", checkError)
      }

      if (existingMember) {
        // Update position if already a member
        const { error: updateMemberError } = await supabase
          .from("lobby_members")
          .update({ position: position || 1 })
          .eq("lobby_id", invitation.lobby_id)
          .eq("user_id", invitation.recipient_id)

        if (updateMemberError) {
          console.error("Error updating member position:", updateMemberError)
        }
      } else {
        // Insert new member
        const { error: insertError } = await supabase
          .from("lobby_members")
          .insert({
            lobby_id: invitation.lobby_id,
            user_id: invitation.recipient_id,
            position: position || 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error("Error adding member to lobby:", insertError)
          return NextResponse.json(
            { success: false, message: "Failed to add member to lobby" },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: accept ? "Invitation accepted" : "Invitation declined"
    })
  } catch (error) {
    console.error("Error in respond-invite API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}