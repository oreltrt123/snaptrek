import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, characterId } = await request.json()

    if (!userId || !characterId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a Supabase client for server-side operations
    const supabase = await createClient()

    // Update the user's equipped character
    const { error } = await supabase.from("profiles").update({ equipped_character: characterId }).eq("id", userId)

    if (error) {
      console.error("Error updating equipped character:", error)
      return NextResponse.json({ error: "Failed to update equipped character", details: error }, { status: 500 })
    }

    // Also save to user_characters if not already there
    const { data: existingCharacter, error: checkError } = await supabase
      .from("user_characters")
      .select("*")
      .eq("user_id", userId)
      .eq("character_id", characterId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking if character exists:", checkError)
    }

    // If the user doesn't already own this character, add it
    if (!existingCharacter && !checkError) {
      const { error: insertError } = await supabase
        .from("user_characters")
        .insert({ user_id: userId, character_id: characterId })

      if (insertError) {
        console.error("Error adding character to user_characters:", insertError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
