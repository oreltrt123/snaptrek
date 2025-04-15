"use client"

import { createBrowserClient } from "@supabase/ssr"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbykdicfoefwuzuefvvy.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFieWtkaWNmb2Vmd3V6dWVmdnZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NjMzNDgsImV4cCI6MjA2MDEzOTM0OH0.idlSWPAVyMaMyZm3xVOBNqae6IV6L5WIvMqoYBqlpWY"

// Create and export the Supabase client
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// For backwards compatibility
export const createClient = () => supabase
