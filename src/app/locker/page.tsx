import { Suspense } from "react"
import ClientOnly from "@/components/client-only"
import LockerContent from "@/components/locker/locker-content"

export default function LockerPage() {
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
        <LockerContent />
      </Suspense>
    </ClientOnly>
  )
}
