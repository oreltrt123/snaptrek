import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the publishable key from environment variables
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY

    // Log for debugging
    console.log("Stripe Publishable Key:", publishableKey)

    if (!publishableKey) {
      return NextResponse.json({ error: "Stripe publishable key is not configured" }, { status: 500 })
    }

    // Return the publishable key
    return NextResponse.json({ publishableKey })
  } catch (error) {
    console.error("Error retrieving Stripe key:", error)
    return NextResponse.json({ error: "Failed to retrieve Stripe configuration" }, { status: 500 })
  }
}
