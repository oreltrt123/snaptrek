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
    const { userId, coins, packageId } = body

    // Validate the request
    if (!userId || !coins) {
      console.error("Missing required fields:", { userId, coins })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("Updating coins for user:", userId, "Adding coins:", coins)
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service Role Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // First, check if the user exists in the auth.users table
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUser) {
      console.error("Error fetching auth user:", authError)
      return NextResponse.json({ error: "User not found in auth system" }, { status: 404 })
    }

    console.log("Auth user found:", authUser.user.id)

    // Check if the user has a profile
    const { data: profileData, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    console.log("Profile data:", profileData, "Fetch error:", fetchError)

    // If profile doesn't exist, create it
    if (!profileData) {
      console.log("Profile not found, creating new profile")

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            id: userId,
            username: authUser.user.email?.split("@")[0] || `user_${Date.now()}`,
            coins: coins,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) {
        console.error("Error creating profile:", insertError)
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
      }

      console.log("New profile created:", insertData)

      // Record the transaction
      const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        amount: coins,
        currency: "coins",
        description: `Purchase of ${coins} Rebels Coins`,
        type: "purchase",
        package_id: packageId, // Use packageId here
      })

      if (transactionError) {
        console.error("Error recording transaction:", transactionError)
      }

      return NextResponse.json({
        success: true,
        message: "Profile created and coins added",
        newBalance: coins,
      })
    }

    // Profile exists, update the coins
    const currentCoins = profileData.coins || 0
    const newCoinsAmount = currentCoins + coins

    console.log("Current coins:", currentCoins, "New coins amount:", newCoinsAmount)

    // Update the coins in the profile
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        coins: newCoinsAmount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()

    if (updateError) {
      console.error("Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to update coins" }, { status: 500 })
    }

    console.log("Profile updated:", updateData)

    // Record the transaction
    const { error: transactionError } = await supabaseAdmin.from("transactions").insert({
      user_id: userId,
      amount: coins,
      currency: "coins",
      description: `Purchase of ${coins} Rebels Coins`,
      type: "purchase",
      package_id: packageId, // Use packageId here
    })

    if (transactionError) {
      console.error("Error recording transaction:", transactionError)
    }

    // Also update the local storage to ensure persistence on page refresh
    return NextResponse.json({
      success: true,
      message: "Coins updated successfully",
      newBalance: newCoinsAmount,
    })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
