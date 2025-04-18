import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { gameId, userId, position, characterId, isMoving, direction } = await request.json()

    if (!gameId || !userId || !position) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create a Supabase client for server-side operations
    const supabase = await createClient()

    // Check if the player is already in the game
    const { data: existingPlayer, error: checkError } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is expected if player isn't in the game yet
      console.error("Error checking if player exists:", checkError)
      return NextResponse.json({ error: "Failed to check if player exists", details: checkError }, { status: 500 })
    }

    // Log the character ID being used
    console.log(`Player ${userId} using character: ${characterId || "default"} in game ${gameId}`)

    if (existingPlayer) {
      // Update existing player
      const { error: updateError } = await supabase
        .from("game_players")
        .update({
          position_x: position.x,
          position_y: position.y,
          position_z: position.z,
          character_id: characterId || existingPlayer.character_id || "default",
          is_moving: isMoving || false,
          direction_x: direction?.x || 0,
          direction_y: direction?.y || 0,
          direction_z: direction?.z || 0,
          last_updated: new Date().toISOString(),
        })
        .eq("game_id", gameId)
        .eq("user_id", userId)

      if (updateError) {
        console.error("Error updating player position:", updateError)
        return NextResponse.json({ error: "Failed to update player position", details: updateError }, { status: 500 })
      }
    } else {
      // Insert new player
      const { error: insertError } = await supabase.from("game_players").insert({
        game_id: gameId,
        user_id: userId,
        position_x: position.x,
        position_y: position.y,
        position_z: position.z,
        character_id: characterId || "default",
        is_moving: isMoving || false,
        direction_x: direction?.x || 0,
        direction_y: direction?.y || 0,
        direction_z: direction?.z || 0,
      })

      if (insertError) {
        console.error("Error inserting player position:", insertError)
        return NextResponse.json({ error: "Failed to insert player position", details: insertError }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error }, { status: 500 })
  }
}
