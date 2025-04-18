import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create a Supabase client for server-side operations
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

    // First, check if the user has a selected character in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("equipped_character") // Using equipped_character based on your existing schema
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // If the user has a selected character, return it
    if (profileData && profileData.equipped_character) {
      return NextResponse.json({ characterId: profileData.equipped_character })
    }

    // If not, check if the user owns any characters
    const { data: ownedCharacters, error: ownedError } = await supabase
      .from("user_characters") // Using user_characters based on your existing schema
      .select("character_id")
      .eq("user_id", userId)

    if (ownedError) {
      console.error("Error fetching owned characters:", ownedError)
      return NextResponse.json({ error: "Failed to fetch owned characters" }, { status: 500 })
    }

    // If the user owns characters, return the first one
    if (ownedCharacters && ownedCharacters.length > 0) {
      return NextResponse.json({ characterId: ownedCharacters[0].character_id })
    }

    // If the user doesn't own any characters, return the Body Blocker (char8)
    return NextResponse.json({ characterId: "char8" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
