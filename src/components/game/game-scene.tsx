"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Stats } from "@react-three/drei"
import * as THREE from "three"
import { CharacterModel } from "@/components/game/character-model"
import { Suspense } from "react"

interface Player {
  id: string
  characterId: string
  position: {
    x: number
    y: number
    z: number
  }
  isMoving: boolean
  direction?: {
    x: number
    y: number
    z: number
  }
}

interface GameSceneProps {
  mode: string
  id: string
  userId: string
  onLoad?: () => void
  onError?: (error: string) => void
  onPositionUpdate?: (position: { x: number; y: number; z: number }) => void
}

function GameMapFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#444444" />

      {/* Grid lines */}
      <gridHelper args={[40, 40, "#888888", "#444444"]} position={[0, 0.01, 0]} />
    </mesh>
  )
}

function DirectionalLight() {
  return (
    <>
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[4096, 4096]}>
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
      </directionalLight>
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />
    </>
  )
}

function Players({ players, userId }: { players: Player[]; userId: string }) {
  return (
    <>
      {players.map((player) => (
        <group key={player.id} position={[player.position.x, player.position.y, player.position.z]}>
          <Suspense fallback={null}>
            <CharacterModel
              characterId={player.characterId || "default"}
              isMoving={player.isMoving}
              direction={
                player.direction
                  ? new THREE.Vector3(player.direction.x, player.direction.y, player.direction.z)
                  : undefined
              }
            />
          </Suspense>
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={player.id === userId ? "#00ff00" : "#ff0000"} />
          </mesh>
        </group>
      ))}
    </>
  )
}

export function GameScene({ mode, id, userId, onLoad, onError, onPositionUpdate }: GameSceneProps) {
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [movementDirection, setMovementDirection] = useState<THREE.Vector3 | undefined>(undefined)
  const [characterId, setCharacterId] = useState<string | null>(null)
  const moveSpeed = 0.1
  const keysPressed = useRef<Record<string, boolean>>({})
  const characterFetchedRef = useRef(false)

  // Fetch the player's character from the API
  useEffect(() => {
    if (!userId || characterFetchedRef.current) return

    const fetchCharacter = async () => {
      try {
        console.log("Fetching character for user:", userId)
        const response = await fetch(`/api/player/character?userId=${userId}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error fetching character:", errorText)
          throw new Error(`Failed to fetch character: ${errorText}`)
        }

        const data = await response.json()
        console.log("Character data received:", data)

        if (data.characterId) {
          console.log("Setting character ID to:", data.characterId)
          setCharacterId(data.characterId)
          // Save to localStorage as backup
          localStorage.setItem("selectedCharacter", data.characterId)
        } else {
          console.warn("No character ID received, using default")
          setCharacterId("char8") // Default to Body Blocker
          localStorage.setItem("selectedCharacter", "char8")
        }

        characterFetchedRef.current = true
      } catch (error) {
        console.error("Error fetching character:", error)
        // Fallback to localStorage
        const savedCharacter = localStorage.getItem("selectedCharacter") || "char8"
        console.log("Using saved character from localStorage:", savedCharacter)
        setCharacterId(savedCharacter)
        characterFetchedRef.current = true
      }
    }

    fetchCharacter()
  }, [userId])

  // Initialize the player when the component mounts and character is loaded
  useEffect(() => {
    if (!characterId) return // Wait until character is loaded

    const initPlayer = async () => {
      try {
        if (!userId) {
          const errorMsg = "No user ID provided for player initialization"
          console.error(errorMsg)
          setError(errorMsg)
          if (onError) onError(errorMsg)
          return
        }

        console.log(`Initializing player with userId: ${userId}, mode: ${mode}, id: ${id}, characterId: ${characterId}`)

        // Join the game
        const joinResponse = await fetch("/api/game/join-game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            sessionId: id,
            mode,
            characterId,
          }),
        })

        if (!joinResponse.ok) {
          const errorData = await joinResponse.json()
          const errorMsg = errorData.error || "Failed to join game"
          console.error("Failed to join game:", errorData)
          setError(errorMsg)
          if (onError) onError(errorMsg)
          return
        }

        console.log("Successfully joined game")
        setLoading(false)
        if (onLoad) onLoad()
      } catch (error) {
        const errorMsg = `Error initializing player: ${error}`
        console.error(errorMsg)
        setError(errorMsg)
        if (onError) onError(errorMsg)
      }
    }

    // Start the countdown and initialize the player
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          initPlayer()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(countdownInterval)
    }
  }, [userId, mode, id, characterId, onLoad, onError])

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Handle player movement
  useEffect(() => {
    if (!characterId) return // Don't process movement until character is loaded

    const handleMovement = () => {
      const moveForward = keysPressed.current["w"] || keysPressed.current["arrowup"]
      const moveBackward = keysPressed.current["s"] || keysPressed.current["arrowdown"]
      const moveLeft = keysPressed.current["a"] || keysPressed.current["arrowleft"]
      const moveRight = keysPressed.current["d"] || keysPressed.current["arrowright"]

      const isMoving = moveForward || moveBackward || moveLeft || moveRight
      setIsMoving(isMoving)

      if (!isMoving) {
        setMovementDirection(undefined)
        return
      }

      // Calculate the new position
      let newX = playerPosition.x
      let newZ = playerPosition.z
      const directionVector = new THREE.Vector3(0, 0, 0)

      if (moveForward) {
        newZ -= moveSpeed
        directionVector.z -= 1
      }
      if (moveBackward) {
        newZ += moveSpeed
        directionVector.z += 1
      }
      if (moveLeft) {
        newX -= moveSpeed
        directionVector.x -= 1
      }
      if (moveRight) {
        newX += moveSpeed
        directionVector.x += 1
      }

      // Normalize the direction vector
      if (directionVector.length() > 0) {
        directionVector.normalize()
        setMovementDirection(directionVector)
      }

      // Check boundaries (keeping player within the map limits)
      newX = Math.max(-20, Math.min(20, newX))
      newZ = Math.max(-20, Math.min(20, newZ))

      const newPosition = { x: newX, y: 0, z: newZ }

      setPlayerPosition(newPosition)
      if (onPositionUpdate) onPositionUpdate(newPosition)

      // Send the new position to the server
      fetch("/api/game/player-position", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          gameId: id,
          position: newPosition,
          isMoving,
          characterId,
          direction:
            directionVector.length() > 0
              ? {
                  x: directionVector.x,
                  y: directionVector.y,
                  z: directionVector.z,
                }
              : undefined,
        }),
      }).catch((error) => {
        console.error("Error updating player position:", error)
      })
    }

    const interval = setInterval(handleMovement, 33) // ~30fps

    return () => {
      clearInterval(interval)
    }
  }, [playerPosition, userId, id, characterId, onPositionUpdate])

  // Fetch players periodically
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/game/players?sessionId=${id}`)
        if (!response.ok) {
          console.error("Failed to fetch players:", await response.text())
          return
        }

        const data = await response.json()
        setPlayers(data.players || [])
      } catch (error) {
        console.error("Error fetching players:", error)
      }
    }

    // Fetch immediately and then every 1 second
    fetchPlayers()
    const interval = setInterval(fetchPlayers, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [id])

  if (loading || countdown > 0 || !characterId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">
            {!characterId
              ? "Loading character..."
              : countdown > 0
                ? `Game starting in ${countdown}`
                : "Loading game..."}
          </div>
          <div className="w-32 h-32 border-t-4 border-purple-500 rounded-full animate-spin mx-auto"></div>
          {characterId && <div className="mt-4 text-lg">Character: {characterId}</div>}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Error</div>
          <div className="text-lg mb-4">{error}</div>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={() => (window.location.href = "/lobby")}
          >
            Return to Lobby
          </button>
        </div>
      </div>
    )
  }

  // Create a merged player list including the local player
  const allPlayers = [
    ...players.filter((p) => p.id !== userId),
    {
      id: userId,
      characterId: characterId,
      position: playerPosition,
      isMoving,
      direction: movementDirection
        ? {
            x: movementDirection.x,
            y: movementDirection.y,
            z: movementDirection.z,
          }
        : undefined,
    },
  ]

  return (
    <div className="h-full w-full">
      <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
        <fog attach="fog" args={["#1f1f1f", 30, 40]} />
        <color attach="background" args={["#1f1f1f"]} />
        <ambientLight intensity={0.3} />
        <DirectionalLight />
        <GameMapFloor />
        <Players players={allPlayers} userId={userId} />
        <Environment preset="city" />
        <OrbitControls
          target={[playerPosition.x, 2, playerPosition.z]}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={20}
        />
        <Stats />
      </Canvas>

      <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-white">
        <div>WASD or Arrow Keys to move</div>
        <div>Mouse to look around</div>
        <div>Players in room: {allPlayers.length}</div>
        <div className="font-bold text-green-400">Your character: {characterId}</div>
      </div>
    </div>
  )
}
