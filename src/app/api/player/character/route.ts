import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Create a Supabase client for server-side operations
    const supabase = await createClient()

    // First, check if the user has a selected character in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("equipped_character")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile", details: profileError }, { status: 500 })
    }

    // If the user has a selected character, return it
    if (profileData && profileData.equipped_character) {
      console.log("Found equipped character:", profileData.equipped_character)
      return NextResponse.json({ characterId: profileData.equipped_character })
    }

    // If not, check if the user owns any characters
    const { data: ownedCharacters, error: ownedError } = await supabase
      .from("user_characters")
      .select("character_id")
      .eq("user_id", userId)

    if (ownedError) {
      console.error("Error fetching owned characters:", ownedError)
      return NextResponse.json({ error: "Failed to fetch owned characters", details: ownedError }, { status: 500 })
    }

    // If the user owns characters, return the first one
    if (ownedCharacters && ownedCharacters.length > 0) {
      console.log("Using first owned character:", ownedCharacters[0].character_id)
      return NextResponse.json({ characterId: ownedCharacters[0].character_id })
    }

    // If the user doesn't own any characters, return the Body Blocker (char8)
    console.log("No characters found, using Body Blocker (char8)")
    return NextResponse.json({ characterId: "char8" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
