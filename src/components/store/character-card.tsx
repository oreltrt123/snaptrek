"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, Eye, Check } from "lucide-react"
import { useState, Suspense, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { CharacterModel } from "@/components/game/character-model"
import Image from "next/image"

interface Character {
  id: string
  name: string
  description: string
  price: number
  rarity: string
  imageUrl: string
  modelPath: string
}

interface CharacterCardProps {
  character: Character
  userCoins: number
  onViewDetails: () => void
  onPurchaseComplete: (characterId: string, price: number) => void
  ownedCharacters: string[]
}

// Camera adjustment component to position the view correctly
function CameraAdjust() {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera to focus more on upper body and face
    camera.position.set(0, -0.2, 2.2)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Fallback component for when model loading fails
function ModelFallback({ character }: { character: Character }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      <div className="relative w-full h-full">
        <Image
          src={character.imageUrl || "/placeholder.svg"}
          alt={character.name}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover"
        />
      </div>
    </div>
  )
}

// Character preview with error handling
function CharacterPreview({ character }: { character: Character }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return <ModelFallback character={character} />
  }

  return (
    <Canvas camera={{ position: [0, -0.2, 2.2], fov: 40 }}>
      <ambientLight intensity={0.7} />
      <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <Suspense fallback={null}>
        {/* Position the model much lower and make it larger */}
        <group position={[0, -1.5, 0]} scale={1.2}>
          <CharacterModel characterId={character.id} onError={() => setHasError(true)} />
        </group>
      </Suspense>
      <CameraAdjust />
      <Environment preset="sunset" />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.5}
      />
    </Canvas>
  )
}

export function CharacterCard({
  character,
  userCoins,
  onViewDetails,
  onPurchaseComplete,
  ownedCharacters,
}: CharacterCardProps) {
  const [purchasing, setPurchasing] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info"
    title: string
    message: string
  } | null>(null)
  const [coins, setCoins] = useState(userCoins)
  const [owned, setOwned] = useState(ownedCharacters.includes(character.id))

  // Check if the character is already owned
  const isOwned = ownedCharacters.includes(character.id) || owned

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
      default:
        return "bg-gray-500"
    }
  }

  const handlePurchase = async () => {
    if (isOwned) {
      // Character is already owned
      setNotification({
        type: "info",
        title: "Already Owned",
        message: `You already own ${character.name}.`,
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
      return
    }

    if (userCoins < character.price) {
      setNotification({
        type: "error",
        title: "Insufficient Coins",
        message: `You need ${character.price - userCoins} more coins to purchase this character.`,
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
        localStorage.setItem("ownedCharacters", JSON.stringify(ownedCharacterIds))
      }

      // Add this console log to verify the character was added
      console.log("Character purchased and saved:", character.id, "Current owned characters:", ownedCharacterIds)

      setNotification({
        type: "success",
        title: "Purchase Successful",
        message: `You've successfully purchased ${character.name}!`,
      })

      setOwned(true)

      // Call the onPurchaseComplete callback
      onPurchaseComplete(character.id, character.price)

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
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

  const canAfford = userCoins >= character.price

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-all">
      {notification && (
        <div className="absolute top-0 left-0 right-0 z-50 p-2">
          <Alert
            className={
              notification.type === "error"
                ? "bg-red-900/50 border-red-500"
                : notification.type === "info"
                  ? "bg-blue-900/50 border-blue-500"
                  : "bg-green-900/50 border-green-500"
            }
          >
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="relative">
        <div
          className={`absolute top-2 right-2 ${getRarityColor(character.rarity)} px-2 py-1 rounded text-xs font-bold z-10`}
        >
          {character.rarity.toUpperCase()}
        </div>

        {/* Owned badge */}
        {isOwned && (
          <div className="absolute top-2 left-2 bg-green-600 px-2 py-1 rounded text-xs font-bold z-10 flex items-center">
            <Check className="h-3 w-3 mr-1" />
            OWNED
          </div>
        )}

        {/* 3D Character Preview */}
        <div className="w-full h-48 bg-gray-700">
          <CharacterPreview character={character} />
        </div>
      </div>

      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold">{character.name}</h3>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-sm text-gray-400 line-clamp-2">{character.description}</p>
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center">
          <Coins className="h-4 w-4 text-yellow-400 mr-1" />
          <span className="font-bold">{character.price}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          {isOwned ? (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled>
              <Check className="h-4 w-4 mr-1" />
              Owned
            </Button>
          ) : (
            <Button
              size="sm"
              className={
                canAfford
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }
              onClick={handlePurchase}
              disabled={!canAfford || purchasing}
            >
              {purchasing ? "Buying..." : "Buy"}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
