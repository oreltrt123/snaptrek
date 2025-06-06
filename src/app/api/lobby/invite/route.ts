import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { recipientId, lobbyId } = await request.json()

    // Validate required fields
    if (!recipientId || !lobbyId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create Supabase client with service role if available
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

    // DIRECT METHOD: Use the direct_invite function that doesn't require authentication
    const { data, error } = await supabase.rpc("direct_invite", {
      recipient_id: recipientId,
      lobby_id: lobbyId
    })

    if (error) {
      console.error("Error sending invitation:", error)
      return NextResponse.json(
        { success: false, message: "Failed to send invitation: " + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in invite API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}