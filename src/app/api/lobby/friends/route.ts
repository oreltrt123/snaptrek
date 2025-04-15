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

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user's friends from the database
    // For now, we'll use the profiles table since we don't have a dedicated friends table
    // In a real implementation, you would have a friends table with user_id and friend_id
    const { data: friends, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .neq("id", session.user.id) // Exclude the current user
      .limit(20)

    if (error) {
      console.error("Error fetching friends:", error)
      return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
    }

    return NextResponse.json({ friends })
  } catch (error) {
    console.error("Error in friends API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
