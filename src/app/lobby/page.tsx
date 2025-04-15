import { Suspense } from "react"
import LobbyContent from "@/components/lobby/lobby-content"
import ClientOnly from "@/components/client-only"

export default function LobbyPage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <LobbyContent />
      </Suspense>
    </ClientOnly>
  )
}
