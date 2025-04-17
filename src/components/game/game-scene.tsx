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

export function GameScene({ mode, id, userId }: GameSceneProps) {
  const [loading, setLoading] = useState(true)
  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3)
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [movementDirection, setMovementDirection] = useState<THREE.Vector3 | undefined>(undefined)
  const [characterId, setCharacterId] = useState("default")
  const moveSpeed = 0.1
  const keysPressed = useRef<Record<string, boolean>>({})

  // Create a player ID
  useEffect(() => {
    // Load selected character from localStorage
    try {
      const selectedCharacter = localStorage.getItem("selectedCharacter") || "default"
      console.log("Loaded selected character:", selectedCharacter)
      setCharacterId(selectedCharacter)
    } catch (error) {
      console.error("Error loading selected character:", error)
    }

    // Initialize the player when the component mounts
    const initPlayer = async () => {
      try {
        if (!userId) {
          console.error("No user ID provided for player initialization")
          setError("No user ID provided")
          return
        }

        console.log(`Initializing player with userId: ${userId}, mode: ${mode}, id: ${id}`)

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
            characterId: characterId, // Use the loaded character ID
          }),
        })

        if (!joinResponse.ok) {
          const errorData = await joinResponse.json()
          console.error("Failed to join game:", errorData)
          setError(errorData.error || "Failed to join game")
          return
        }

        console.log("Successfully joined game")
        setLoading(false)
      } catch (error) {
        console.error("Error initializing player:", error)
        setError("Error initializing player")
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
  }, [userId, mode, id, characterId])

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

      setPlayerPosition((prev) => ({
        ...prev,
        x: newX,
        z: newZ,
      }))

      // Send the new position to the server
      fetch("/api/game/player-position", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          sessionId: id,
          position: { x: newX, y: 0, z: newZ },
          isMoving,
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
  }, [playerPosition, userId, id])

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

  if (loading || countdown > 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">
            {countdown > 0 ? `Game starting in ${countdown}` : "Loading game..."}
          </div>
          <div className="w-32 h-32 border-t-4 border-purple-500 rounded-full animate-spin mx-auto"></div>
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
      </div>
    </div>
  )
}
