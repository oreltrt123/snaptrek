import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Force dynamic to prevent caching
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

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

    // Get all invitations
    const { data: allInvitations, error: invitationsError } = await supabase
      .from("lobby_invitations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (invitationsError) {
      return NextResponse.json({
        success: false,
        message: "Error fetching invitations",
        error: invitationsError.message
      })
    }

    // Get RLS policies
    const { data: rlsPolicies, error: rlsError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'lobby_invitations' })

    // Get user-specific invitations if userId is provided
    let userInvitations = null
    if (userId) {
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
        .order("created_at", { ascending: false })

      if (!error) {
        userInvitations = data
      }
    }

    return NextResponse.json({
      success: true,
      allInvitations,
      userInvitations,
      rlsPolicies
    })
  } catch (error) {
    console.error("Error in debug-invitations API:", error)
    return NextResponse.json(
      { success: false, message: "Server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    )
  }
}