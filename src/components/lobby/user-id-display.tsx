"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Copy, RefreshCw } from 'lucide-react'

export function UserIdDisplay() {
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const supabase = createClientComponentClient()

  const refreshUserInfo = async () => {
    try {
      // Try to get from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)
        
        // Get username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single()
          
        if (profile?.username) {
          setUsername(profile.username)
        }
        
        // Store in localStorage
        localStorage.setItem('userId', user.id)
        if (profile?.username) {
          localStorage.setItem('username', profile.username)
        }
      } else {
        // Try localStorage
        const storedUserId = localStorage.getItem('userId')
        const storedUsername = localStorage.getItem('username')
        
        if (storedUserId) {
          setUserId(storedUserId)
        }
        
        if (storedUsername) {
          setUsername(storedUsername)
        }
      }
    } catch (error) {
      console.error("Error getting user info:", error)
    }
  }

  useEffect(() => {
    refreshUserInfo()
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      refreshUserInfo()
    })
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const copyToClipboard = () => {
    if (userId) {
      navigator.clipboard.writeText(userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!userId) {
    return (
      <div className="p-4 bg-yellow-900/30 border border-yellow-500 rounded-lg">
        <p className="text-yellow-400 text-sm">User ID not found</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full border-yellow-500 text-yellow-400"
          onClick={refreshUserInfo}
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-purple-900/30 border border-purple-500 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-purple-400 font-medium">Your User Info</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-purple-400"
          onClick={refreshUserInfo}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      {username && (
        <p className="text-white text-sm mb-1">
          <span className="text-purple-400">Username:</span> {username}
        </p>
      )}
      
      <div className="flex items-center gap-2">
        <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 flex-1 overflow-hidden">
          <span className="block truncate">{userId}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 border-purple-500 text-purple-400"
          onClick={copyToClipboard}
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  )
}