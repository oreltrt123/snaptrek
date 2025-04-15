"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  // Log the actual error to console for debugging
  console.error("Client component error:", error)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">
          We encountered an error while loading this page. This might be due to a temporary issue or a problem with your
          browser.
        </p>
        <div className="text-sm text-gray-400 mb-4 overflow-auto max-h-32">
          <code>{error.message}</code>
        </div>
        <Button onClick={resetErrorBoundary} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return <ErrorBoundary FallbackComponent={ErrorFallback}>{isClient ? <>{children}</> : <>{fallback}</>}</ErrorBoundary>
}
