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

    // Check if profiles table exists
    const { error: tableCheckError } = await supabase.from("profiles").select("id").limit(1)

    if (tableCheckError) {
      if (tableCheckError.message.includes("does not exist")) {
        return NextResponse.json({
          error: "The profiles table doesn't exist",
          solution: "Run the SQL migration to create the profiles table",
          sqlToRun: `
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`,
        })
      }

      return NextResponse.json({ error: "Database error", details: tableCheckError.message })
    }

    // Count users in profiles table
    const { count, error: countError } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    if (countError) {
      return NextResponse.json({ error: "Error counting users", details: countError.message })
    }

    // If no users, create test users
    if (count === 0) {
      // Create test users
      const testUsers = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          username: "TestUser1",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=1",
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          username: "TestUser2",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=2",
        },
        {
          id: "00000000-0000-0000-0000-000000000003",
          username: "TestUser3",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=3",
        },
      ]

      const { error: insertError } = await supabase.from("profiles").insert(testUsers)

      if (insertError) {
        return NextResponse.json({
          error: "Failed to create test users",
          details: insertError.message,
          solution: "You may need to manually insert users or check your auth.users table",
        })
      }

      return NextResponse.json({
        success: true,
        message: "Created test users successfully. Refresh your user list to see them.",
      })
    }

    // If we have users, return count
    return NextResponse.json({
      success: true,
      userCount: count,
      message: `Found ${count} users in the database. If you're not seeing them in the UI, check your API response.`,
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error", details: errorMessage })
  }
}
