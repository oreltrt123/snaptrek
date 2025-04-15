import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Add this line to prevent static generation
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
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

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Test database connection with a simple query that won't fail
    const { data: testData, error: testError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get session details safely
    const sessionDetails = session
      ? {
          user: {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          },
          expiresAt: session.expires_at,
        }
      : null

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      auth: {
        authenticated: !!session,
        sessionDetails: sessionDetails,
      },
      database: {
        connectionTest: testError ? "Failed: " + testError.message : "Success",
        userCount: testData?.count || 0,
      },
      cookies: {
        count: cookieStore.getAll().length,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
