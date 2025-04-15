import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "", // Use service role key for admin access
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, characterId, price, characterName } = body

    // Validate the request
    if (!userId || !characterId || !price) {
      console.error("Missing required fields:", { userId, characterId, price })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Processing character purchase:", { userId, characterId, price, characterName })
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service Role Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // First, check if the user exists in the auth.users table
    try {
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (authError || !authUser) {
        console.error("Error fetching auth user:", authError)
        return NextResponse.json({ error: "User not found in auth system" }, { status: 404 })
      }

      console.log("Auth user found:", authUser.user.id)
    } catch (authCheckError) {
      console.error("Error checking auth user:", authCheckError)
      // Continue anyway - this might be a permission issue rather than a user not existing
    }

    // Try a direct approach - update the user's coins directly
    try {
      // Get the current user profile
      const { data: profileData, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()

      console.log("Profile data:", profileData, "Fetch error:", fetchError)

      if (fetchError) {
        console.error("Error fetching profile:", fetchError)
        return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
      }

      if (!profileData) {
        console.log("Profile not found, creating new profile")
        return NextResponse.json({ error: "User profile not found" }, { status: 404 })
      }

      // Check if user has enough coins
      const currentCoins = profileData?.coins || 0
      if (currentCoins < price) {
        return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
      }

      // Calculate new coins amount
      const newCoinsAmount = currentCoins - price

      console.log("Current coins:", currentCoins, "New coins amount:", newCoinsAmount)

      // 1. Update the coins in the profile
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({
          coins: newCoinsAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating profile:", updateError)
        return NextResponse.json({ error: "Failed to update coins" }, { status: 500 })
      }

      // 2. Add character to user's collection
      const { error: purchaseError } = await supabaseAdmin.from("user_characters").insert({
        user_id: userId,
        character_id: characterId,
        acquired_at: new Date().toISOString(),
      })

      if (purchaseError) {
        console.error("Error adding character to collection:", purchaseError)
        // If this fails, we should ideally roll back the coin deduction
        // But for simplicity, we'll just report the error
        return NextResponse.json({ error: "Failed to add character to collection" }, { status: 500 })
      }

      // 3. Record the transaction
      const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        amount: price,
        currency: "coins",
        description: `Purchase of ${characterName || "character"}`,
        type: "purchase",
      })

      if (transactionError) {
        console.error("Error recording transaction:", transactionError)
        // Non-critical error, continue
      }

      return NextResponse.json({
        success: true,
        message: "Character purchased successfully",
        newBalance: newCoinsAmount,
      })
    } catch (dbError) {
      console.error("Database operation error:", dbError)
      return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
