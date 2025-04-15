"use client"

import { useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function StoreUserId() {
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Function to store user ID
    const storeUserId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log("Storing user ID in localStorage:", user.id)
          localStorage.setItem('userId', user.id)
          
          // Also store username if available
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single()
            
          if (profile?.username) {
            localStorage.setItem('username', profile.username)
          }
        }
      } catch (error) {
        console.error("Error storing user ID:", error)
      }
    }

    // Call immediately
    storeUserId()
    
    // Also set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        localStorage.setItem('userId', session.user.id)
        console.log("Auth state changed - stored user ID:", session.user.id)
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        console.log("Auth state changed - removed user ID")
      }
    })
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}