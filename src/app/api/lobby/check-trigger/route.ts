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

    // Check if the trigger exists
    const { data: triggerData, error: triggerError } = await supabase.rpc("check_trigger_exists", {
      trigger_name: "on_auth_user_created",
    })

    // Count users in auth.users
    const { count: authCount, error: authError } = await supabase
      .from("auth.users")
      .select("*", { count: "exact", head: true })

    // Count users in profiles
    const { count: profilesCount, error: profilesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    return NextResponse.json({
      triggerExists: triggerData || false,
      triggerError: triggerError?.message,
      authUsersCount: authCount || 0,
      authError: authError?.message,
      profilesCount: profilesCount || 0,
      profilesError: profilesError?.message,
      status: "This endpoint checks if the auth trigger is working correctly",
    })
  } catch (error) {
    console.error("Error checking trigger:", error)
    return NextResponse.json({ error: "Failed to check trigger status" }, { status: 500 })
  }
}
