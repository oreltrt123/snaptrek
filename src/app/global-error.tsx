"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-8 max-w-md text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Application Error</h2>
            <p className="mb-6">
              We encountered a critical error while loading the application. Please try refreshing the page.
            </p>
            <Button onClick={reset} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}
