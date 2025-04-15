"use client"

import { useEffect, useState, type ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">
          We encountered an error while loading this page. This might be due to a temporary issue or a problem with your
          browser.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
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
