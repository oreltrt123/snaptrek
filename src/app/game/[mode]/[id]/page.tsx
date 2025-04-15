import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { GameView } from "@/components/game/game-view"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default async function GamePage({
  params,
}: {
  params: Promise<{ mode: string; id: string }>
}) {
  // Await the params Promise to get the actual values
  const { mode, id } = await params

  // Create a Supabase client for server-side auth check
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to login if not authenticated
    redirect("/login")
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Game View Component */}
      <GameView mode={mode} gameId={id} userId={session.user.id} />

      {/* Exit Button */}
      <div className="absolute top-4 right-4 z-20">
        <form action="/lobby">
          <Button type="submit" variant="outline" className="border-2 border-red-500 text-white hover:bg-red-500/20">
            <Home className="mr-2 h-4 w-4" />
            Exit Game
          </Button>
        </form>
      </div>
    </div>
  )
}
