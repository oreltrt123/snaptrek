import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { senderId, recipientId, lobbyId } = await request.json()

    if (!senderId || !recipientId || !lobbyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: senderId, recipientId, or lobbyId" },
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

    // Delete any existing invitations to avoid duplicates
    await supabase
      .from("lobby_invitations")
      .delete()
      .eq("recipient_id", recipientId)
      .eq("lobby_id", lobbyId)

    // Insert invitation directly
    const { data, error } = await supabase
      .from("lobby_invitations")
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        lobby_id: lobbyId,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error("Error creating manual invitation:", error)
      return NextResponse.json(
        { success: false, message: "Failed to create invitation", error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Manual invitation created successfully",
      invitation: data[0]
    })
  } catch (error) {
    console.error("Error in manual-invite API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}