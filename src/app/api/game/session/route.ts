import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase-service"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get("gameId")

  if (!gameId) {
    return NextResponse.json({ error: "Game ID is required" }, { status: 400 })
  }

  try {
    // Get all players in the game
    const { data: players, error: playersError } = await supabase.from("game_players").select("*").eq("game_id", gameId)

    if (playersError) {
      console.error("Error fetching players:", playersError)
      return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
    }

    // Get game session details
    const { data: gameSession, error: gameError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("id", gameId)
      .single()

    if (gameError && gameError.code !== "PGRST116") {
      console.error("Error fetching game session:", gameError)
      return NextResponse.json({ error: "Failed to fetch game session" }, { status: 500 })
    }

    return NextResponse.json({
      gameId,
      playerCount: players.length,
      maxPlayers: gameSession?.max_players || 10,
      mode: gameSession?.mode || "solo",
      players: players.map((p) => ({
        id: p.user_id,
        characterId: p.character_id,
        position: {
          x: p.position_x,
          y: p.position_y,
          z: p.position_z,
        },
        isMoving: p.is_moving,
        isSprinting: p.is_sprinting,
        isJumping: p.is_jumping,
        health: p.health,
        team: p.team,
      })),
    })
  } catch (error) {
    console.error("Error getting game session:", error)
    return NextResponse.json({ error: "Failed to get game session" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, userId, characterId } = body

    if (!mode || !userId || !characterId) {
      return NextResponse.json({ error: "Mode, user ID, and character ID are required" }, { status: 400 })
    }

    // Find available games
    const { data: availableGames, error: gamesError } = await supabase
      .from("game_sessions")
      .select("*")
      .eq("mode", mode)
      .eq("status", "waiting")
      .lt("current_players", "max_players")
      .order("created_at", { ascending: false })

    if (gamesError) {
      console.error("Error finding available games:", gamesError)
      return NextResponse.json({ error: "Failed to find available games" }, { status: 500 })
    }

    let gameId: string

    if (availableGames && availableGames.length > 0) {
      // Join an existing game
      gameId = availableGames[0].id

      // Check if player is already in this game
      const { data: existingPlayer, error: checkError } = await supabase
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .eq("user_id", userId)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking if player exists:", checkError)
        return NextResponse.json({ error: "Failed to check if player exists" }, { status: 500 })
      }

      // If player is not already in this game, add them
      if (!existingPlayer) {
        const { error: joinError } = await supabase.from("game_players").insert({
          user_id: userId,
          game_id: gameId,
          character_id: characterId,
          position_x: 0,
          position_y: 0,
          position_z: 0,
          is_moving: false,
          health: 100,
          inventory: JSON.stringify({ weapons: [], items: [] }),
        })

        if (joinError) {
          console.error("Error joining game:", joinError)
          return NextResponse.json({ error: "Failed to join game" }, { status: 500 })
        }

        // Update player count
        const { error: updateError } = await supabase
          .from("game_sessions")
          .update({ current_players: availableGames[0].current_players + 1 })
          .eq("id", gameId)

        if (updateError) {
          console.error("Error updating player count:", updateError)
          return NextResponse.json({ error: "Failed to update player count" }, { status: 500 })
        }
      }
    } else {
      // Create a new game
      // Determine max players based on mode
      let maxPlayers = 10
      switch (mode) {
        case "solo":
          maxPlayers = 10
          break
        case "duo":
          maxPlayers = 10
          break
        case "trio":
          maxPlayers = 12
          break
        case "duel":
          maxPlayers = 2
          break
      }

      const { data: newGame, error: createError } = await supabase
        .from("game_sessions")
        .insert({
          mode,
          max_players: maxPlayers,
          current_players: 1,
          status: "waiting",
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating game session:", createError)
        return NextResponse.json({ error: "Failed to create game session" }, { status: 500 })
      }

      gameId = newGame.id

      // Join the new game
      const { error: joinError } = await supabase.from("game_players").insert({
        user_id: userId,
        game_id: gameId,
        character_id: characterId,
        position_x: 0,
        position_y: 0,
        position_z: 0,
        is_moving: false,
        health: 100,
        inventory: JSON.stringify({ weapons: [], items: [] }),
      })

      if (joinError) {
        console.error("Error joining new game:", joinError)
        return NextResponse.json({ error: "Failed to join new game" }, { status: 500 })
      }
    }

    return NextResponse.json({ gameId })
  } catch (error) {
    console.error("Error creating/joining game session:", error)
    return NextResponse.json({ error: "Failed to create/join game session" }, { status: 500 })
  }
}
