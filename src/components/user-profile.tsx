"use client"
import { UserCircle, Settings, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { createClient } from "../../supabase/client"
import { useRouter } from "next/navigation"
import "../styles/profile-components.css"

export default function UserProfile() {
  const supabase = createClient()
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserCircle className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="profile-dropdown-menu">
        <DropdownMenuItem
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/")
          }}
          className="profile-dropdown-item"
        >
          <LogOut className="profile-dropdown-item-icon h-4 w-4" />
          Sign out
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="profile-dropdown-item">
          <Settings className="profile-dropdown-item-icon h-4 w-4" />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
