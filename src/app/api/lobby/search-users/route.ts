import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("query")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
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

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Search for users by username
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${query}%`)
      .order("username")
      .limit(20)

    if (error) {
      console.error("Error searching users:", error)
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
    }

    // Filter out the current user if logged in
    const filteredUsers = session ? users.filter((user) => user.id !== session.user.id) : users

    return NextResponse.json({ users: filteredUsers })
  } catch (error) {
    console.error("Error in search-users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
