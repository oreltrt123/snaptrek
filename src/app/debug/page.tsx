import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export const dynamic = "force-dynamic"

export default async function DebugPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // Get the user session
  const sessionResponse = await supabase.auth.getSession()
  const session = sessionResponse.data.session
  const sessionError = sessionResponse.error

  // Get all cookies for debugging
  const allCookies = cookieStore.getAll()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-purple-400">Authentication Debug</h1>

      <div className="grid grid-cols-1 gap-8 max-w-3xl mx-auto">
        <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Session Status</h2>
          <div className="bg-gray-800 p-4 rounded-md">
            <p className="mb-2">
              <span className="font-bold">Session Exists:</span>{" "}
              <span className={session ? "text-green-400" : "text-red-400"}>{session ? "Yes" : "No"}</span>
            </p>
            {session && (
              <>
                <p className="mb-2">
                  <span className="font-bold">User ID:</span> <span className="text-green-400">{session.user.id}</span>
                </p>
                <p className="mb-2">
                  <span className="font-bold">Email:</span>{" "}
                  <span className="text-green-400">{session.user.email || "Not available"}</span>
                </p>
              </>
            )}
            {sessionError && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-md">
                <p className="font-bold text-red-400">Session Error:</p>
                <p className="text-red-300">{sessionError.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-purple-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-purple-400">Authentication Cookies</h2>
          <div className="bg-gray-800 p-4 rounded-md">
            {allCookies.length > 0 ? (
              <ul className="space-y-2">
                {allCookies.map((cookie, index) => (
                  <li key={index} className="border-b border-gray-700 pb-2">
                    <p className="font-bold">{cookie.name}</p>
                    <p className="text-sm text-gray-400">
                      Value: {cookie.name.includes("supabase") ? "[REDACTED]" : cookie.value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-400">No cookies found</p>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <a href="/login" className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md">
            Go to Login
          </a>
          <a href="/lobby" className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-md">
            Try Lobby Again
          </a>
        </div>
      </div>
    </div>
  )
}
