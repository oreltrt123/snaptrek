"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function SupabaseRealtimeTest() {
  const [messages, setMessages] = useState<string[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [testId, setTestId] = useState("")

  useEffect(() => {
    // Generate a unique test ID
    setTestId(`test-${Math.random().toString(36).substring(2, 9)}`)
  }, [])

  const subscribe = () => {
    setMessages((prev) => [...prev, "Subscribing to realtime changes..."])

    // Create a test table if it doesn't exist
    supabase
      .rpc("execute_sql", {
        sql: `
        CREATE TABLE IF NOT EXISTS realtime_test (
          id TEXT PRIMARY KEY,
          message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        COMMENT ON TABLE realtime_test IS 'Realtime enabled: true';
      `,
      })
      .then(({ error }) => {
        if (error) {
          setMessages((prev) => [...prev, `Error creating test table: ${error.message}`])
          return
        }

        setMessages((prev) => [...prev, "Test table created or already exists"])

        // Subscribe to changes
        const channel = supabase
          .channel("realtime-test")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "realtime_test",
            },
            (payload) => {
              setMessages((prev) => [...prev, `Received event: ${payload.eventType} - ${JSON.stringify(payload.new)}`])
            },
          )
          .subscribe((status) => {
            setMessages((prev) => [...prev, `Subscription status: ${status.status}`])
            setIsSubscribed(status.status === "SUBSCRIBED")
          })

        // Clean up on unmount
        return () => {
          channel.unsubscribe()
        }
      })
  }

  const sendTestMessage = () => {
    setMessages((prev) => [...prev, "Sending test message..."])

    supabase
      .from("realtime_test")
      .upsert({
        id: testId,
        message: `Test message at ${new Date().toISOString()}`,
      })
      .then(({ error }) => {
        if (error) {
          setMessages((prev) => [...prev, `Error sending test message: ${error.message}`])
        } else {
          setMessages((prev) => [...prev, "Test message sent successfully"])
        }
      })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Realtime Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={subscribe} disabled={isSubscribed}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
            <Button onClick={sendTestMessage} disabled={!isSubscribed}>
              Send Test Message
            </Button>
          </div>

          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-auto">
            {messages.map((message, index) => (
              <div key={index} className="text-sm mb-1">
                {message}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm">No messages yet. Click Subscribe to start.</div>
            )}
          </div>

          <div className="text-sm text-gray-500">Test ID: {testId}</div>
        </div>
      </CardContent>
    </Card>
  )
}
