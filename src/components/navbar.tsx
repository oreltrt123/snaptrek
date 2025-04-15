"use client" // Ensures this runs on the client-side

import Link from "next/link"
import { supabase } from "../../supabase/client"
import { Button } from "./ui/button"
import UserProfile from "./user-profile"
import { useEffect, useState } from "react"
import "../styles/navbar.css"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  // Use localStorage to cache the auth state to prevent flickering
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)

      try {
        // First check if we have a cached user in localStorage
        const cachedUser = localStorage.getItem("cachedUser")

        if (cachedUser) {
          setUser(JSON.parse(cachedUser))
          setLoading(false)
        }

        // Then verify with Supabase (this runs in background)
        const {
          data: { user: supabaseUser },
        } = await supabase.auth.getUser()

        if (supabaseUser) {
          // Store minimal user data to avoid localStorage size limits
          const minimalUserData = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            user_metadata: supabaseUser.user_metadata,
          }

          localStorage.setItem("cachedUser", JSON.stringify(minimalUserData))
        } else {
          localStorage.removeItem("cachedUser")
          setUser(null)
        }
      } catch (error) {
        console.error("Auth error:", error)
        localStorage.removeItem("cachedUser")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const minimalUserData = {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        }
        localStorage.setItem("cachedUser", JSON.stringify(minimalUserData))
        setLoading(false)
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("cachedUser")
        setUser(null)
        setLoading(false)
      }
    })

    checkAuth()

    // Clean up the subscription
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [pathname]) // Re-run when pathname changes to ensure auth state is fresh on navigation

  return (
    <nav className="w-full border-gray-900 py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold text-white">
          SnapTrek
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          {/* <Link href="/docs" className="text-gray-300 hover:text-white group relative inline-block">
            Docs
            <span className="absolute inset-0 border-b border-white scale-0 group-hover:scale-100 transition-transform origin-left"></span>
          </Link> */}
          <Link href="/store" className="text-gray-300 hover:text-white group relative inline-block">
            Snap Credits
            <span className="absolute inset-0 border-b border-white scale-0 group-hover:scale-100 transition-transform origin-left"></span>
          </Link>
          {/* <Link href="/blog" className="text-gray-300 hover:text-white group relative inline-block">
            Blog
            <span className="absolute inset-0 border-b border-white scale-0 group-hover:scale-100 transition-transform origin-left"></span>
          </Link> */}
        </div>
        <div className="flex gap-4 items-center">
          {loading ? (
            // Show a subtle loading state instead of auth buttons while checking
            <div className="flex gap-4 items-center opacity-0">
              <div className="w-24 h-10"></div>
            </div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white">
                <Button variant="outline" className="border-gray-800 text-white hover:text-white hover:bg-gray-900">
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/lobby">
                <button className="button23 bg-black text-white border-gray-800" type="button">
                  Lobby
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
