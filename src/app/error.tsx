"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="mb-6">
          We encountered an error while loading this page. This might be due to a temporary issue or a problem with your
          browser.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="border-white text-white hover:bg-white/20">
              Go to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
