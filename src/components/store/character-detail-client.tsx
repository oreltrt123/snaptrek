"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, ArrowLeft, ShoppingCart, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"

// Dynamically import the CharacterViewer component with SSR disabled
const CharacterViewer = dynamic(
  () => import("@/components/store/character-viewer").then((mod) => ({ default: mod.CharacterViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
  },
)

interface Character {
  id: string
  name: string
  description: string
  price: number
  rarity: string
  imageUrl: string
  modelPath: string
  stats?: {
    strength: number
    agility: number
    defense: number
    magic: number
  }
}

interface CharacterDetailClientProps {
  character: Character
  userId: string // Will be used for database operations
}

export function CharacterDetailClient({
  character,
  userId, // eslint-disable-line @typescript-eslint/no-unused-vars
}: CharacterDetailClientProps) {
  const [coins, setCoins] = useState(0)
  const [owned, setOwned] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
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

    // Check if user owns this character from localStorage
    try {
      const storedOwnedCharacters = localStorage.getItem("ownedCharacters")
      let ownedCharacterIds: string[] = []

      if (storedOwnedCharacters) {
        ownedCharacterIds = JSON.parse(storedOwnedCharacters)
        if (ownedCharacterIds.includes(character.id)) {
          setOwned(true)
        }
      }

      // Load coins from localStorage
      const localCoins = localStorage.getItem("userCoins")
      if (localCoins) {
        setCoins(Number.parseInt(localCoins, 10))
      }
    } catch (parseError) {
      console.error("Error parsing data:", parseError)
    }
  }, [character.id])

  const handlePurchase = async () => {
    if (owned) {
      setNotification({
        type: "error",
        title: "Already Owned",
        message: `You already own ${character.name}.`,
      })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (coins < character.price) {
      setNotification({
        type: "error",
        title: "Insufficient Coins",
        message: `You need ${character.price - coins} more coins to purchase this character.`,
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setPurchasing(true)

    try {
      // Update coins
      const newCoinsAmount = coins - character.price
      setCoins(newCoinsAmount)
      localStorage.setItem("userCoins", newCoinsAmount.toString())

      // Update owned characters
      const storedOwnedCharacters = localStorage.getItem("ownedCharacters")
      const ownedCharacterIds: string[] = storedOwnedCharacters ? JSON.parse(storedOwnedCharacters) : []

      if (!ownedCharacterIds.includes(character.id)) {
        ownedCharacterIds.push(character.id)
        // Log the updated owned characters
        console.log("Character purchased:", character.id, "Updated owned characters:", ownedCharacterIds)
        localStorage.setItem("ownedCharacters", JSON.stringify(ownedCharacterIds))
      }

      setNotification({
        type: "success",
        title: "Purchase Successful",
        message: `You've successfully purchased ${character.name}!`,
      })

      setOwned(true)

      // Clear notification after 3 seconds and redirect to locker
      setTimeout(() => {
        setNotification(null)
        // Add a flag to indicate we should refresh the locker
        sessionStorage.setItem("refreshLocker", "true")
        router.push("/locker")
      }, 2000)
    } catch (error) {
      console.error("Purchase error:", error)
      setNotification({
        type: "error",
        title: "Purchase Failed",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setPurchasing(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500 text-white"
      case "uncommon":
        return "bg-green-500 text-white"
      case "rare":
        return "bg-blue-500 text-white"
      case "epic":
        return "bg-purple-500 text-white"
      case "legendary":
        return "bg-yellow-500 text-black"
      default:
        return "bg-gray-500 text-white"
    }
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
          <Button variant="ghost" onClick={() => router.push("/store")} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <div className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${getRarityColor(character.rarity)}`}>
            {character.rarity.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Character Viewer */}
          <div className="bg-gray-800 rounded-lg overflow-hidden h-[500px]">
            {mounted && <CharacterViewer modelPath={character.modelPath} />}
          </div>

          {/* Character Details */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="text-gray-300">{character.description}</p>
              </CardContent>
            </Card>

            {character.stats && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Stats</h2>
                  <div className="space-y-4">
                    {Object.entries(character.stats).map(([stat, value]) => (
                      <div key={stat}>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 capitalize">{stat}</span>
                          <span className="text-white font-bold">{value}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-cyan-600 h-2.5 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Category</h2>
                <div className="inline-block bg-gray-700 px-3 py-1 rounded-full text-sm">Skin</div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Coins className="h-6 w-6 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold">{character.price}</span>
              </div>

              <div className="flex gap-4">
                {owned ? (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/locker")}>
                    <Check className="mr-2 h-5 w-5" />
                    Owned - Go to Locker
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="border-2 border-purple-500 text-white hover:bg-purple-500/20"
                      onClick={() => router.push("/store?buy=coins")}
                      disabled={purchasing}
                    >
                      <Coins className="mr-2 h-5 w-5" />
                      Buy Coins
                    </Button>
                    <Button
                      className={
                        coins >= character.price
                          ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                          : "bg-gray-700 text-gray-400 cursor-not-allowed"
                      }
                      onClick={handlePurchase}
                      disabled={coins < character.price || purchasing}
                    >
                      {purchasing ? (
                        "Purchasing..."
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
