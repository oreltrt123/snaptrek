"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface SaveCharacterSelectionProps {
  characterId: string
  userId: string
}

export function SaveCharacterSelection({ characterId, userId }: SaveCharacterSelectionProps) {
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClientComponentClient()

  const saveCharacterSelection = async () => {
    if (!characterId || !userId) return

    setIsSaving(true)

    try {
      console.log(`Saving character ${characterId} for user ${userId}`)

      // Save to localStorage first (for immediate feedback)
      localStorage.setItem("selectedCharacter", characterId)

      // Then save to the database
      const { error } = await supabase.from("profiles").update({ equipped_character: characterId }).eq("id", userId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error saving character selection:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button onClick={saveCharacterSelection} disabled={isSaving} className="w-full mt-4">
      {isSaving ? "Saving..." : "Select Character"}
    </Button>
  )
}
