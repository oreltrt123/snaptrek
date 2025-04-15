import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
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
    const currentUserId = session?.user?.id

    // Get all users EXCEPT current user (if logged in)
    let query = supabase.from("profiles").select("id, username, avatar_url").order("username").limit(50)

    // Only filter out current user if we have one
    if (currentUserId) {
      query = query.neq("id", currentUserId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error fetching users:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    // Log the number of users found for debugging
    console.log(`Found ${data?.length || 0} users`)

    // Return empty array instead of null if no data
    return NextResponse.json({ users: data || [] })
  } catch (error) {
    console.error("Unexpected error in all-users API:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", details: errorMessage }, { status: 500 })
  }
}
