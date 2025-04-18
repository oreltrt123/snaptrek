"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Grid } from "@react-three/drei"
import * as THREE from "three"
import { Suspense } from "react"
import { CharacterModel } from "./character-model"

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

interface Game3DSceneProps {
  mode: string
  userId: string
  gameId?: string
}

export default function Game3DScene({ mode, userId, gameId }: Game3DSceneProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [movementDirection, setMovementDirection] = useState<THREE.Vector3 | undefined>(undefined)
  const [characterId, setCharacterId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const moveSpeed = 0.1
  const keysPressed = useRef<Record<string, boolean>>({})
  const characterFetchedRef = useRef(false)
  const sessionId = gameId || "default-session"

  // Debug logging
  useEffect(() => {
    console.log("Game3DScene mounted with:", { mode, userId, gameId: sessionId })
  }, [mode, userId, sessionId])

  // Fetch the player's character from localStorage or API
  useEffect(() => {
    if (!userId || characterFetchedRef.current) return

    const fetchCharacter = async () => {
      try {
        console.log("Fetching character for user:", userId)

        // First try to get from localStorage
        const savedCharacter = localStorage.getItem("selectedCharacter")
        if (savedCharacter) {
          console.log("Found character in localStorage:", savedCharacter)
          setCharacterId(savedCharacter)
          characterFetchedRef.current = true
          return
        }

        // If not in localStorage, try the API
        const response = await fetch(`/api/player/character?userId=${userId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch character: ${await response.text()}`)
        }

        const data = await response.json()
        console.log("Character data received from API:", data)

        if (data.characterId) {
          console.log("Setting character ID to:", data.characterId)
          setCharacterId(data.characterId)
          // Save to localStorage for future use
          localStorage.setItem("selectedCharacter", data.characterId)
        } else {
          console.warn("No character ID received, using default")
          setCharacterId("char8") // Default to Body Blocker
          localStorage.setItem("selectedCharacter", "char8")
        }

        characterFetchedRef.current = true
      } catch (error) {
        console.error("Error fetching character:", error)
        // Fallback to Body Blocker
        console.log("Using Body Blocker as fallback")
        setCharacterId("char8")
        localStorage.setItem("selectedCharacter", "char8")
        characterFetchedRef.current = true
      } finally {
        setLoading(false)
      }
    }

    fetchCharacter()
  }, [userId])

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

      setPlayerPosition({ x: newX, y: 0, z: newZ })

      // Send the new position to the server if we have a gameId
      if (sessionId !== "default-session") {
        fetch("/api/game/player-position", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            gameId: sessionId,
            position: { x: newX, y: 0, z: newZ },
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
    }

    const interval = setInterval(handleMovement, 33) // ~30fps

    return () => {
      clearInterval(interval)
    }
  }, [playerPosition, userId, sessionId, characterId])

  // Create the local player
  const localPlayer: Player = {
    id: userId,
    characterId: characterId || "char8",
    position: playerPosition,
    isMoving,
    direction: movementDirection
      ? {
          x: movementDirection.x,
          y: movementDirection.y,
          z: movementDirection.z,
        }
      : undefined,
  }

  if (loading || !characterId) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Loading character...</div>
          <div className="w-32 h-32 border-t-4 border-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
        <fog attach="fog" args={["#1f1f1f", 30, 40]} />
        <color attach="background" args={["#1f1f1f"]} />
        <ambientLight intensity={0.3} />

        {/* Directional light */}
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow>
          <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
        </directionalLight>
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#444444" />
          <Grid
            args={[40, 40]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#6f6f6f"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#9d4b4b"
            fadeDistance={50}
            fadeStrength={1}
          />
        </mesh>

        {/* Player character */}
        <group position={[localPlayer.position.x, localPlayer.position.y, localPlayer.position.z]}>
          <Suspense fallback={null}>
            <CharacterModel
              characterId={localPlayer.characterId}
              isMoving={localPlayer.isMoving}
              direction={
                localPlayer.direction
                  ? new THREE.Vector3(localPlayer.direction.x, localPlayer.direction.y, localPlayer.direction.z)
                  : undefined
              }
            />
          </Suspense>
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>
        </group>

        {/* Environment and controls */}
        <Environment preset="city" />
        <OrbitControls
          target={[localPlayer.position.x, 2, localPlayer.position.z]}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>

      {/* Debug info */}
      <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded text-white">
        <div>WASD or Arrow Keys to move</div>
        <div>Mouse to look around</div>
        <div className="font-bold text-green-400">Your character: {characterId}</div>
      </div>
    </div>
  )
}
