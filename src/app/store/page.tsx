import { Suspense } from "react"
import ClientOnly from "@/components/client-only"
import StoreContent from "@/components/store/store-content"

export default function StorePage() {
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
        <StoreContent />
      </Suspense>
    </ClientOnly>
  )
}
