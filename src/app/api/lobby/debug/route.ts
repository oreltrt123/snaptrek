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

    // Get current user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    // Check if profiles table exists and count users
    const { data: profilesCount, error: profilesError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Check if lobby_invitations table exists and count invitations
    const { data: invitationsCount, error: invitationsError } = await supabase
      .from("lobby_invitations")
      .select("*", { count: "exact", head: true })

    // Check if lobby_members table exists and count members
    const { data: membersCount, error: membersError } = await supabase
      .from("lobby_members")
      .select("*", { count: "exact", head: true })

    // Check if the trigger exists
    const { data: triggerExists, error: triggerError } = await supabase.rpc("check_trigger_exists", {
      trigger_name: "on_auth_user_created",
      table_name: "users",
      schema_name: "auth",
    })

    // Get database tables
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    return NextResponse.json({
      auth: {
        authenticated: !!session?.user,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              metadata: session.user.user_metadata,
            }
          : null,
        error: sessionError ? sessionError.message : null,
      },
      database: {
        tables: tables?.map((t) => t.table_name) || [],
        tablesError: tablesError ? tablesError.message : null,
        profiles: {
          exists: !profilesError || !profilesError.message.includes("does not exist"),
          count: profilesCount?.count || 0,
          error: profilesError ? profilesError.message : null,
        },
        lobby_invitations: {
          exists: !invitationsError || !invitationsError.message.includes("does not exist"),
          count: invitationsCount?.count || 0,
          error: invitationsError ? invitationsError.message : null,
        },
        lobby_members: {
          exists: !membersError || !membersError.message.includes("does not exist"),
          count: membersCount?.count || 0,
          error: membersError ? membersError.message : null,
        },
        trigger: {
          exists: !!triggerExists,
          error: triggerError ? triggerError.message : null,
        },
      },
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
