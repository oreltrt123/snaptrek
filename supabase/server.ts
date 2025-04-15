import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createBrowserClient } from "@supabase/supabase-js"

// Server-side supabase client
export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
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
}

// Client-side supabase client
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables, using empty strings")
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
