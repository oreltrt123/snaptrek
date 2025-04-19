"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import dynamic from "next/dynamic"

// Dynamically import the CharacterPreview component with SSR disabled
const CharacterPreview = dynamic(() => import("@/components/game/character-preview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
})

// Character data structure
interface Character {
  id: string
  name: string
  description: string
  rarity: string
  modelPath: string
  thumbnailUrl?: string
}

// Define store characters outside the component to avoid dependency issues
const storeCharacters: Record<string, Character> = {
  char1: {
    id: "char1",
    name: "Shadow Warrior",
    description: "A stealthy fighter with exceptional agility and precision.",
    rarity: "rare",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/cybernetic-guardian.png",
  },
  char2: {
    id: "char2",
    name: "Cyber Knight",
    description: "Armored protector with advanced tech and powerful shields.",
    rarity: "epic",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/armored-enforcer.png",
  },
  char3: {
    id: "char3",
    name: "Mystic Mage",
    description: "Wields ancient magic with devastating elemental attacks.",
    rarity: "rare",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/arcane-scholar.png",
  },
  char4: {
    id: "char4",
    name: "Neon Assassin",
    description: "Lightning-fast striker that leaves a trail of neon light.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/cyber-shadow.png",
  },
  char5: {
    id: "char5",
    name: "Void Walker",
    description: "A mysterious entity that can phase through dimensions and manipulate dark energy.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/void-walker.png",
  },
  char6: {
    id: "char6",
    name: "Cosmic Wanderer",
    description: "A traveler from beyond the stars with mysterious cosmic powers.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
    thumbnailUrl: "/celestial-wanderer.png",
  },
  char7: {
    id: "char7",
    name: "Astral Nomad",
    description: "A dimensional traveler who harnesses the power of celestial bodies and astral energy.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
    thumbnailUrl: "/astral-nomad.png",
  },
  char8: {
    id: "char8",
    name: "Aerial Guardian",
    description: "A masterful defender who can fly above the battlefield, raining down protective energy on allies.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/aerial-guardian.png",
  },
  bodyblock: {
    id: "bodyblock",
    name: "Body Blocker",
    description: "A special character with unique blocking abilities and movements.",
    rarity: "mythic",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/body-blocker.png",
  },
  standarddle: {
    id: "standarddle",
    name: "Standarddle",
    description: "A versatile fighter with balanced abilities and smooth animations from Mixamo.",
    rarity: "legendary",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    thumbnailUrl: "/body-blocker.png",
  },
}

// Default character defined outside component
const defaultCharacter: Character = {
  id: "default",
  name: "Default Character",
  description: "A balanced fighter with average stats",
  rarity: "common",
  modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
}

export default function LockerContent() {
  const [loading, setLoading] = useState(true)
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<string>("default")
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    title: string
    message: string
  } | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Set mounted state to true when component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load owned characters function
  const loadOwnedCharacters = useCallback(() => {
    // Start with the default character and BodyBlock character (always available)
    const ownedCharacters: Character[] = [
      defaultCharacter,
      storeCharacters.bodyblock, // Always include the BodyBlock character
    ]

    if (typeof window === "undefined") {
      return ownedCharacters
    }

    // Load owned characters from localStorage
    const storedOwnedCharacters = localStorage.getItem("ownedCharacters")
    let ownedCharacterIds: string[] = []

    if (storedOwnedCharacters) {
      try {
        ownedCharacterIds = JSON.parse(storedOwnedCharacters)
        console.log("Loaded owned character IDs:", ownedCharacterIds)
      } catch (e) {
        console.error("Error parsing owned characters:", e)
        ownedCharacterIds = []
      }
    }

    // Add owned characters from the store - ensuring no duplicates
    if (ownedCharacterIds.length > 0) {
      // Create a Set to track which character IDs we've already added
      const addedCharacterIds = new Set<string>(["default", "bodyblock"])

      ownedCharacterIds.forEach((charId) => {
        // Only add if we haven't already added this character
        if (!addedCharacterIds.has(charId) && storeCharacters[charId]) {
          console.log("Adding character to locker:", charId, storeCharacters[charId].name)
          addedCharacterIds.add(charId)
          ownedCharacters.push(storeCharacters[charId])
        } else if (!storeCharacters[charId]) {
          console.warn("Character not found in store characters:", charId)
        }
      })
    }

    console.log(
      "Final characters list:",
      ownedCharacters.map((c) => c.id),
    )
    return ownedCharacters
  }, [])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.log("Session check error:", error.message)
          router.push("/login")
          return
        }

        if (!data.session) {
          router.push("/login")
          return
        }

        // Load saved character selection from localStorage
        if (typeof window !== "undefined") {
          const savedCharacter = localStorage.getItem("selectedCharacter")
          if (savedCharacter) {
            setSelectedCharacter(savedCharacter)
          }

          // Load owned characters
          const ownedCharacters = loadOwnedCharacters()
          setCharacters(ownedCharacters)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking session:", err)
        router.push("/login")
      }
    }

    checkSession()
  }, [router, loadOwnedCharacters])

  const handleSelectCharacter = (characterId: string) => {
    setSelectedCharacter(characterId)
  }

  const handleSaveSelection = async () => {
    if (typeof window !== "undefined") {
      // Save to localStorage for persistence across page refreshes
      localStorage.setItem("selectedCharacter", selectedCharacter)
      console.log("Saved selected character to localStorage:", selectedCharacter)

      // Set a flag in sessionStorage to indicate we're coming from the locker
      sessionStorage.setItem("fromLocker", "true")
    }

    setNotification({
      type: "success",
      title: "Character Selected",
      message: "Your character selection has been saved.",
    })

    setTimeout(() => {
      setNotification(null)
      router.push("/lobby")
    }, 1500)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-yellow-500"
      case "mythic":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {notification && (
        <div className="fixed top-4 right-4 z-50 w-80">
          <Alert
            className={
              notification.type === "error" ? "bg-red-900/50 border-red-500" : "bg-green-900/50 border-green-500"
            }
          >
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.push("/lobby")} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Character Locker</h1>
          <Button
            variant="outline"
            onClick={() => router.push("/store")}
            className="ml-auto border-2 border-purple-500 text-white hover:bg-purple-500/20"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Store
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden h-[500px]">
              {mounted && (
                <div className="w-full h-full">
                  <CharacterPreview characterId={selectedCharacter} />
                </div>
              )}
            </div>
          </div>

          {/* Character Selection */}
          <div className="col-span-1">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Your Characters</h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {characters.length > 0 ? (
                  characters.map((character, index) => (
                    <div
                      key={`${character.id}-${index}`} // Using both ID and index to ensure uniqueness
                      className={`
                        flex items-center p-3 rounded-lg cursor-pointer transition-all
                        ${
                          selectedCharacter === character.id
                            ? "bg-purple-500/30 border border-purple-500"
                            : "bg-gray-700 hover:bg-gray-600"
                        }
                      `}
                      onClick={() => handleSelectCharacter(character.id)}
                    >
                      <div className="w-12 h-12 bg-gray-600 rounded-full mr-3 flex items-center justify-center overflow-hidden">
                        {character.thumbnailUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={character.thumbnailUrl || "/placeholder.svg"}
                              alt={character.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl">{character.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{character.name}</div>
                        <div className="flex items-center">
                          <div className={`${getRarityColor(character.rarity)} w-2 h-2 rounded-full mr-1`}></div>
                          <div className="text-xs text-gray-400 capitalize">{character.rarity}</div>
                        </div>
                      </div>
                      {selectedCharacter === character.id && <Check className="h-5 w-5 text-purple-400" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No characters found</p>
                    <p className="text-sm mt-2">Visit the store to purchase characters</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveSelection}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  Save Selection
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
