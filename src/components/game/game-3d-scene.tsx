"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Sparkles, Cloud, Stars, Html } from "@react-three/drei"
import * as THREE from "three"
import { Suspense } from "react"
import { CharacterModel } from "./character-model"
import { WeaponItem } from "./weapon-item"
import { TreeModel } from "./tree-model"
import { CombatArena } from "./combat-arena"
import { MapEnvironment } from "./map-environment"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client directly in this file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  // Disable schema cache to avoid issues
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-disable-cache": "true",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

interface Player {
  id: string
  characterId: string
  position: {
    x: number
    y: number
    z: number
  }
  isMoving: boolean
  isSprinting?: boolean
  isJumping?: boolean
  direction?: {
    x: number
    y: number
    z: number
  }
  health?: number
  team?: string
}

interface Weapon {
  id: string
  type: string
  position: {
    x: number
    y: number
    z: number
  }
}

interface Game3DSceneProps {
  mode: string
  userId: string
  gameId: string
  characterId: string
  otherPlayers: any[]
  onInventoryUpdate?: (inventory: { weapons: string[]; items: string[] }) => void
}

export default function Game3DScene({
  mode,
  userId,
  gameId,
  characterId,
  otherPlayers,
  onInventoryUpdate,
}: Game3DSceneProps) {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 })
  const [isMoving, setIsMoving] = useState(false)
  const [isSprinting, setIsSprinting] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const [movementDirection, setMovementDirection] = useState<THREE.Vector3 | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugKeys, setDebugKeys] = useState<string[]>([])
  const [cameraRotation, setCameraRotation] = useState(0)
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [inventory, setInventory] = useState<{ weapons: string[]; items: string[] }>({ weapons: [], items: [] })
  const [remotePlayerPositions, setRemotePlayerPositions] = useState<Record<string, any>>({})
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [playerColors, setPlayerColors] = useState<Record<string, string>>({})

  const moveSpeed = 0.1
  const sprintMultiplier = 2.0
  const keysPressed = useRef<Record<string, boolean>>({})
  const sessionId = gameId
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const characterRef = useRef<THREE.Group>(null)
  const lastUpdateTime = useRef<number>(0)
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 })

  // Generate map features based on game mode
  const mapFeatures = useMemo(() => {
    const features = {
      trees: [] as { position: [number, number, number]; scale: number; type: string }[],
      weapons: [] as Weapon[],
      hasCentralArena: false,
      terrain: "default",
      skyPreset: "sunset",
    }

    // Different map configurations based on mode
    switch (mode) {
      case "solo":
        // Forest map with many trees and weapons
        features.terrain = "forest"
        features.skyPreset = "sunset"

        // Generate 30 random trees
        for (let i = 0; i < 30; i++) {
          const x = (Math.random() - 0.5) * 38
          const z = (Math.random() - 0.5) * 38
          // Avoid placing trees in the center
          if (Math.sqrt(x * x + z * z) < 5) continue

          features.trees.push({
            position: [x, 0, z],
            scale: 0.8 + Math.random() * 0.4,
            type: Math.random() > 0.7 ? "pine" : "oak",
          })
        }

        // Add 5 weapons
        for (let i = 0; i < 5; i++) {
          const x = (Math.random() - 0.5) * 30
          const z = (Math.random() - 0.5) * 30
          features.weapons.push({
            id: `weapon-${i}`,
            type: ["sword", "axe", "staff"][Math.floor(Math.random() * 3)],
            position: { x, y: 0.5, z },
          })
        }
        break

      case "duo":
        // Mountain terrain with fewer trees but more open space
        features.terrain = "mountain"
        features.skyPreset = "dawn"
        features.hasCentralArena = false

        // Generate 15 random trees in clusters
        for (let i = 0; i < 3; i++) {
          const clusterX = (Math.random() - 0.5) * 30
          const clusterZ = (Math.random() - 0.5) * 30

          for (let j = 0; j < 5; j++) {
            const x = clusterX + (Math.random() - 0.5) * 8
            const z = clusterZ + (Math.random() - 0.5) * 8
            features.trees.push({
              position: [x, 0, z],
              scale: 0.7 + Math.random() * 0.5,
              type: "pine",
            })
          }
        }

        // Add 8 weapons
        for (let i = 0; i < 8; i++) {
          const x = (Math.random() - 0.5) * 30
          const z = (Math.random() - 0.5) * 30
          features.weapons.push({
            id: `weapon-${i}`,
            type: ["sword", "axe", "staff"][Math.floor(Math.random() * 3)],
            position: { x, y: 0.5, z },
          })
        }
        break

      case "trio":
        // Desert terrain with few trees but more open combat space
        features.terrain = "desert"
        features.skyPreset = "night"

        // Generate 10 random trees (desert palms)
        for (let i = 0; i < 10; i++) {
          const x = (Math.random() - 0.5) * 38
          const z = (Math.random() - 0.5) * 38
          features.trees.push({
            position: [x, 0, z],
            scale: 0.9 + Math.random() * 0.3,
            type: "palm",
          })
        }

        // Add 10 weapons
        for (let i = 0; i < 10; i++) {
          const x = (Math.random() - 0.5) * 30
          const z = (Math.random() - 0.5) * 30
          features.weapons.push({
            id: `weapon-${i}`,
            type: ["sword", "axe", "staff"][Math.floor(Math.random() * 3)],
            position: { x, y: 0.5, z },
          })
        }
        break

      case "duel":
        // Arena map with central combat area
        features.terrain = "arena"
        features.skyPreset = "night"
        features.hasCentralArena = true

        // Only a few trees around the edges
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2
          const distance = 15 + Math.random() * 3
          const x = Math.cos(angle) * distance
          const z = Math.sin(angle) * distance

          features.trees.push({
            position: [x, 0, z],
            scale: 1 + Math.random() * 0.2,
            type: Math.random() > 0.5 ? "oak" : "pine",
          })
        }

        // Add 4 weapons in the center
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2
          const x = Math.cos(angle) * 3
          const z = Math.sin(angle) * 3
          features.weapons.push({
            id: `weapon-${i}`,
            type: ["sword", "axe", "staff", "sword"][i],
            position: { x, y: 0.5, z },
          })
        }
        break

      default:
        // Default map
        features.terrain = "default"

        // Generate 20 random trees
        for (let i = 0; i < 20; i++) {
          const x = (Math.random() - 0.5) * 38
          const z = (Math.random() - 0.5) * 38
          features.trees.push({
            position: [x, 0, z],
            scale: 0.8 + Math.random() * 0.4,
            type: Math.random() > 0.5 ? "oak" : "pine",
          })
        }

        // Add 5 weapons
        for (let i = 0; i < 5; i++) {
          const x = (Math.random() - 0.5) * 30
          const z = (Math.random() - 0.5) * 30
          features.weapons.push({
            id: `weapon-${i}`,
            type: ["sword", "axe", "staff"][Math.floor(Math.random() * 3)],
            position: { x, y: 0.5, z },
          })
        }
    }

    return features
  }, [mode])

  // Generate consistent colors for players
  const getPlayerColor = (playerId: string) => {
    if (!playerColors[playerId]) {
      // Generate a consistent color based on player ID
      const hash = playerId.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0)
      const colors = [
        "#ff5555",
        "#55ff55",
        "#5555ff",
        "#ffff55",
        "#ff55ff",
        "#55ffff",
        "#ff9955",
        "#55ff99",
        "#9955ff",
        "#99ff55",
        "#ff5599",
        "#5599ff",
      ]
      const newColor = colors[hash % colors.length]
      setPlayerColors((prev) => ({ ...prev, [playerId]: newColor }))
      return newColor
    }
    return playerColors[playerId]
  }

  // Debug logging
  useEffect(() => {
    console.log("Game3DScene mounted with:", { mode, userId, gameId: sessionId })
    console.log("Initial otherPlayers:", otherPlayers)

    // Initialize weapons from map features
    setWeapons(mapFeatures.weapons)

    // Initialize player position with a random offset to avoid all players spawning at the same spot
    const randomX = (Math.random() - 0.5) * 6
    const randomZ = (Math.random() - 0.5) * 6
    setPlayerPosition({ x: randomX, y: 0, z: randomZ })
    lastPositionRef.current = { x: randomX, y: 0, z: randomZ }

    // Update initial position in database
    supabase
      .from("game_players")
      .update({
        position_x: randomX,
        position_y: 0,
        position_z: randomZ,
      })
      .eq("game_id", gameId)
      .eq("user_id", userId)
      .then(({ error }) => {
        if (error) {
          console.error("Error updating initial position:", error)
          setDebugInfo(`Error updating initial position: ${error.message}`)
        } else {
          setDebugInfo("Initial position updated successfully")
        }
      })

    // Initialize remote player positions from otherPlayers prop
    if (otherPlayers && otherPlayers.length > 0) {
      console.log("Initializing remote players:", otherPlayers)
      const initialPositions: Record<string, any> = {}

      otherPlayers.forEach((player) => {
        initialPositions[player.user_id] = {
          position: {
            x: player.position_x || 0,
            y: player.position_y || 0,
            z: player.position_z || 0,
          },
          isMoving: player.is_moving || false,
          isSprinting: player.is_sprinting || false,
          isJumping: player.is_jumping || false,
          direction: player.direction_x
            ? {
                x: player.direction_x,
                y: player.direction_y || 0,
                z: player.direction_z || 0,
              }
            : undefined,
          characterId: player.character_id || "char8",
        }
      })

      setRemotePlayerPositions(initialPositions)
      setDebugInfo(`Initialized ${otherPlayers.length} remote players`)
    }

    setLoading(false)
  }, [mode, userId, sessionId, mapFeatures, gameId, otherPlayers])

  // Set up keyboard controls with improved focus handling
  useEffect(() => {
    // Function to handle key down events
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current[key] = true

      // Update debug state
      setDebugKeys(Object.keys(keysPressed.current).filter((k) => keysPressed.current[k]))

      // Handle sprint key (shift)
      if (key === "shift") {
        setIsSprinting(true)
      }

      // Handle jump key (space)
      if (key === " " || key === "space") {
        setIsJumping(true)
        // Reset jump after animation completes
        setTimeout(() => setIsJumping(false), 1000)
      }

      // Log key press for debugging
      console.log(`Key down: ${key}`)
    }

    // Function to handle key up events
    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keysPressed.current[key] = false

      // Update debug state
      setDebugKeys(Object.keys(keysPressed.current).filter((k) => keysPressed.current[k]))

      // Handle sprint key release
      if (key === "shift") {
        setIsSprinting(false)
      }

      // Log key release for debugging
      console.log(`Key up: ${key}`)
    }

    // Function to handle focus
    const handleFocus = () => {
      console.log("Game canvas gained focus")
    }

    // Function to handle blur
    const handleBlur = () => {
      console.log("Game canvas lost focus")
      // Reset all keys when focus is lost
      keysPressed.current = {}
      setDebugKeys([])
      setIsSprinting(false)
    }

    // Add event listeners to the window
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("focus", handleFocus)
    window.addEventListener("blur", handleBlur)

    // Also add event listeners to the canvas element if it exists
    if (canvasRef.current) {
      canvasRef.current.addEventListener("keydown", handleKeyDown)
      canvasRef.current.addEventListener("keyup", handleKeyUp)
      canvasRef.current.addEventListener("focus", handleFocus)
      canvasRef.current.addEventListener("blur", handleBlur)
    }

    // Make sure the canvas has focus
    if (canvasRef.current) {
      canvasRef.current.focus()
    }

    // Clean up event listeners
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      window.removeEventListener("focus", handleFocus)
      window.removeEventListener("blur", handleBlur)

      if (canvasRef.current) {
        canvasRef.current.removeEventListener("keydown", handleKeyDown)
        canvasRef.current.removeEventListener("keyup", handleKeyUp)
        canvasRef.current.removeEventListener("focus", handleFocus)
        canvasRef.current.removeEventListener("blur", handleBlur)
      }
    }
  }, [])

  // Set up real-time subscription to other players' positions
  useEffect(() => {
    console.log("Setting up real-time subscription for game:", gameId)
    setDebugInfo("Setting up real-time subscription...")

    // Try multiple channel names to ensure we get updates
    const channels = []

    // Channel 1: Using player_positions_publication format
    const playerPositionsChannel = supabase
      .channel(`player-positions-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // Ignore updates for the current player
          if (payload.new && payload.new.user_id !== userId) {
            console.log("Remote player update received from channel 1:", payload.new)
            setDebugInfo(`Remote player update: ${payload.new.user_id}`)

            // Update the remote player's position
            setRemotePlayerPositions((prev) => ({
              ...prev,
              [payload.new.user_id]: {
                position: {
                  x: payload.new.position_x || 0,
                  y: payload.new.position_y || 0,
                  z: payload.new.position_z || 0,
                },
                isMoving: payload.new.is_moving || false,
                isSprinting: payload.new.is_sprinting || false,
                isJumping: payload.new.is_jumping || false,
                direction: payload.new.direction_x
                  ? {
                      x: payload.new.direction_x,
                      y: payload.new.direction_y || 0,
                      z: payload.new.direction_z || 0,
                    }
                  : undefined,
                characterId: payload.new.character_id || "char8",
              },
            }))
          }
        },
      )
      .subscribe((status) => {
        console.log("Channel 1 subscription status:", status)
        setDebugInfo(`Channel 1 status: ${JSON.stringify(status)}`)
      })

    channels.push(playerPositionsChannel)

    // Channel 2: Using direct table name
    const directTableChannel = supabase
      .channel(`game_players-${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          // Ignore updates for the current player
          if (payload.new && payload.new.user_id !== userId) {
            console.log("Remote player update received from channel 2:", payload.new)
            setDebugInfo(`Channel 2 update: ${payload.new.user_id}`)

            // Update the remote player's position
            setRemotePlayerPositions((prev) => ({
              ...prev,
              [payload.new.user_id]: {
                position: {
                  x: payload.new.position_x || 0,
                  y: payload.new.position_y || 0,
                  z: payload.new.position_z || 0,
                },
                isMoving: payload.new.is_moving || false,
                isSprinting: payload.new.is_sprinting || false,
                isJumping: payload.new.is_jumping || false,
                direction: payload.new.direction_x
                  ? {
                      x: payload.new.direction_x,
                      y: payload.new.direction_y || 0,
                      z: payload.new.direction_z || 0,
                    }
                  : undefined,
                characterId: payload.new.character_id || "char8",
              },
            }))
          }
        },
      )
      .subscribe((status) => {
        console.log("Channel 2 subscription status:", status)
        setDebugInfo(`Channel 2 status: ${JSON.stringify(status)}`)
      })

    channels.push(directTableChannel)

    // Periodically check for new players that might not be in our state yet
    const playerCheckInterval = setInterval(() => {
      supabase
        .from("game_players")
        .select("*")
        .eq("game_id", gameId)
        .neq("user_id", userId)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching players:", error)
          } else if (data && data.length > 0) {
            console.log("Periodic player check found:", data.length, "players")

            // Update remote players
            const updatedPositions = { ...remotePlayerPositions }
            let hasNewPlayers = false

            data.forEach((player) => {
              if (!updatedPositions[player.user_id]) {
                hasNewPlayers = true
                updatedPositions[player.user_id] = {
                  position: {
                    x: player.position_x || 0,
                    y: player.position_y || 0,
                    z: player.position_z || 0,
                  },
                  isMoving: player.is_moving || false,
                  isSprinting: player.is_sprinting || false,
                  isJumping: player.is_jumping || false,
                  direction: player.direction_x
                    ? {
                        x: player.direction_x,
                        y: player.direction_y || 0,
                        z: player.direction_z || 0,
                      }
                    : undefined,
                  characterId: player.character_id || "char8",
                }
              }
            })

            if (hasNewPlayers) {
              console.log("Adding new remote players:", updatedPositions)
              setRemotePlayerPositions(updatedPositions)
              setDebugInfo(`Found ${Object.keys(updatedPositions).length} total remote players`)
            }
          }
        })
    }, 2000) // Check every 2 seconds

    return () => {
      console.log("Cleaning up real-time subscription")
      channels.forEach((channel) => channel.unsubscribe())
      clearInterval(playerCheckInterval)
    }
  }, [gameId, userId])

  // Handle player movement with improved keyboard handling
  useEffect(() => {
    const handleMovement = () => {
      // Check for WASD and arrow keys
      const moveForward = keysPressed.current["w"] || keysPressed.current["arrowup"]
      const moveBackward = keysPressed.current["s"] || keysPressed.current["arrowdown"]
      const moveLeft = keysPressed.current["a"] || keysPressed.current["arrowleft"]
      const moveRight = keysPressed.current["d"] || keysPressed.current["arrowright"]

      // Check for camera rotation keys (Q and E)
      const rotateLeft = keysPressed.current["q"]
      const rotateRight = keysPressed.current["e"]

      // Handle camera rotation
      if (rotateLeft) {
        setCameraRotation((prev) => prev + 0.05)
      }
      if (rotateRight) {
        setCameraRotation((prev) => prev - 0.05)
      }

      const isMoving = moveForward || moveBackward || moveLeft || moveRight
      setIsMoving(isMoving)

      if (!isMoving) {
        setMovementDirection(undefined)
        return
      }

      // Calculate the new position based on camera rotation
      let newX = playerPosition.x
      let newZ = playerPosition.z
      const directionVector = new THREE.Vector3(0, 0, 0)

      // Apply camera rotation to movement direction
      const cosRotation = Math.cos(cameraRotation)
      const sinRotation = Math.sin(cameraRotation)

      // Apply sprint multiplier if sprinting
      const currentSpeed = isSprinting ? moveSpeed * sprintMultiplier : moveSpeed

      if (moveForward) {
        newX -= sinRotation * currentSpeed
        newZ -= cosRotation * currentSpeed
        directionVector.x -= sinRotation
        directionVector.z -= cosRotation
      }
      if (moveBackward) {
        newX += sinRotation * currentSpeed
        newZ += cosRotation * currentSpeed
        directionVector.x += sinRotation
        directionVector.z += cosRotation
      }
      if (moveLeft) {
        newX -= cosRotation * currentSpeed
        newZ += sinRotation * currentSpeed
        directionVector.x -= cosRotation
        directionVector.z += sinRotation
      }
      if (moveRight) {
        newX += cosRotation * currentSpeed
        newZ -= sinRotation * currentSpeed
        directionVector.x += cosRotation
        directionVector.z -= sinRotation
      }

      // Normalize the direction vector
      if (directionVector.length() > 0) {
        directionVector.normalize()
        setMovementDirection(directionVector)
      }

      // Check boundaries (keeping player within the map limits)
      newX = Math.max(-20, Math.min(20, newX))
      newZ = Math.max(-20, Math.min(20, newZ))

      // Update local position state
      setPlayerPosition({ x: newX, y: 0, z: newZ })
      lastPositionRef.current = { x: newX, y: 0, z: newZ }

      // Check for weapon pickups
      checkWeaponPickups(newX, newZ)

      // Send the new position to the server
      // Only update the server every 100ms to avoid flooding
      const now = Date.now()
      if (now - lastUpdateTime.current > 100) {
        lastUpdateTime.current = now

        supabase
          .from("game_players")
          .update({
            position_x: newX,
            position_y: 0,
            position_z: newZ,
            is_moving: isMoving,
            is_sprinting: isSprinting,
            is_jumping: isJumping,
            direction_x: directionVector?.x,
            direction_y: directionVector?.y,
            direction_z: directionVector?.z,
          })
          .eq("game_id", gameId)
          .eq("user_id", userId)
          .then(({ error }) => {
            if (error) {
              console.error("Error updating player position:", error)
              setDebugInfo(`Error updating position: ${error.message}`)
            }
          })
      }
    }

    const interval = setInterval(handleMovement, 33) // ~30fps

    return () => {
      clearInterval(interval)
    }
  }, [playerPosition, userId, gameId, cameraRotation, isSprinting])

  // Check for weapon pickups
  const checkWeaponPickups = (playerX: number, playerZ: number) => {
    const pickupDistance = 1.5 // Distance at which player can pick up weapons

    // Check each weapon
    const remainingWeapons = weapons.filter((weapon) => {
      const dx = weapon.position.x - playerX
      const dz = weapon.position.z - playerZ
      const distance = Math.sqrt(dx * dx + dz * dz)

      // If player is close enough, pick up the weapon
      if (distance < pickupDistance) {
        console.log(`Picked up ${weapon.type}!`)

        // Add to inventory
        setInventory((prev) => {
          const newInventory = {
            ...prev,
            weapons: [...prev.weapons, weapon.type],
          }

          // Notify parent component
          if (onInventoryUpdate) {
            onInventoryUpdate(newInventory)
          }

          return newInventory
        })

        return false // Remove this weapon from the array
      }

      return true // Keep this weapon in the array
    })

    // Update weapons array if any were picked up
    if (remainingWeapons.length !== weapons.length) {
      setWeapons(remainingWeapons)
    }
  }

  // Create the local player
  const localPlayer: Player = {
    id: userId,
    characterId: characterId,
    position: playerPosition,
    isMoving,
    isSprinting,
    isJumping,
    direction: movementDirection
      ? {
          x: movementDirection.x,
          y: movementDirection.y,
          z: movementDirection.z,
        }
      : undefined,
    health: 100,
  }

  // Custom camera component for third-person view
  const ThirdPersonCamera = () => {
    const cameraDistance = 5
    const cameraHeight = 2

    useFrame(({ camera }) => {
      // Calculate camera position based on player position and camera rotation
      const x = localPlayer.position.x + Math.sin(cameraRotation) * cameraDistance
      const z = localPlayer.position.z + Math.cos(cameraRotation) * cameraDistance

      // Set camera position
      camera.position.set(x, cameraHeight, z)

      // Make camera look at player (slightly above player's head)
      camera.lookAt(localPlayer.position.x, localPlayer.position.y + 1.5, localPlayer.position.z)
    })

    return null
  }

  // Debug component to show player info
  const DebugOverlay = () => {
    return (
      <div className="fixed bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs z-50 max-w-xs">
        <div>Game ID: {gameId}</div>
        <div>User ID: {userId.substring(0, 8)}...</div>
        <div>Remote Players: {Object.keys(remotePlayerPositions).length}</div>
        <div>
          Position: X:{playerPosition.x.toFixed(2)} Z:{playerPosition.z.toFixed(2)}
        </div>
        <div>Debug: {debugInfo}</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">Loading game world...</div>
          <div className="w-32 h-32 border-t-4 border-purple-500 rounded-full animate-spin mx-auto"></div>
          <div className="mt-4 text-sm opacity-70">{debugInfo}</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-full" tabIndex={0}>
        <Canvas ref={canvasRef} shadows camera={{ position: [0, 2, 5], fov: 60 }} tabIndex={0}>
          <fog attach="fog" args={["#1f1f1f", 30, 40]} />
          <color attach="background" args={["#1f1f1f"]} />
          <ambientLight intensity={0.3} />

          {/* Directional light */}
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow>
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
          </directionalLight>
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />

          {/* Environment based on game mode */}
          <MapEnvironment mode={mode} terrain={mapFeatures.terrain} skyPreset={mapFeatures.skyPreset} />

          {/* Trees */}
          <Suspense fallback={null}>
            {mapFeatures.trees.map((tree, index) => (
              <TreeModel key={`tree-${index}`} position={tree.position} scale={tree.scale} type={tree.type} />
            ))}
          </Suspense>

          {/* Combat Arena for duel mode */}
          {mapFeatures.hasCentralArena && <CombatArena position={[0, 0, 0]} />}

          {/* Weapons on the ground */}
          <Suspense fallback={null}>
            {weapons.map((weapon) => (
              <WeaponItem
                key={weapon.id}
                type={weapon.type}
                position={[weapon.position.x, weapon.position.y, weapon.position.z]}
              />
            ))}
          </Suspense>

          {/* Player character */}
          <group ref={characterRef} position={[localPlayer.position.x, localPlayer.position.y, localPlayer.position.z]}>
            <Suspense fallback={null}>
              <CharacterModel
                characterId={localPlayer.characterId}
                isMoving={localPlayer.isMoving}
                isSprinting={localPlayer.isSprinting}
                isJumping={localPlayer.isJumping}
                direction={
                  localPlayer.direction
                    ? new THREE.Vector3(localPlayer.direction.x, localPlayer.direction.y, localPlayer.direction.z)
                    : undefined
                }
              />
            </Suspense>
            {/* Player name label */}
            <Html position={[0, 2.5, 0]} center>
              <div className="bg-purple-900/80 px-2 py-1 rounded text-white text-xs whitespace-nowrap">
                You (Player {userId.substring(0, 6)})
              </div>
            </Html>
          </group>

          {/* Other players */}
          {Object.entries(remotePlayerPositions).map(([playerId, playerData]) => (
            <group
              key={`player-${playerId}`}
              position={[playerData.position.x, playerData.position.y, playerData.position.z]}
            >
              <Suspense fallback={null}>
                <CharacterModel
                  characterId={playerData.characterId || "char8"}
                  isMoving={playerData.isMoving}
                  isSprinting={playerData.isSprinting}
                  isJumping={playerData.isJumping}
                  direction={
                    playerData.direction
                      ? new THREE.Vector3(playerData.direction.x, playerData.direction.y, playerData.direction.z)
                      : undefined
                  }
                />
              </Suspense>

              {/* Player name label with unique color */}
              <Html position={[0, 2.5, 0]} center>
                <div
                  className="px-2 py-1 rounded text-white text-xs whitespace-nowrap"
                  style={{ backgroundColor: getPlayerColor(playerId) }}
                >
                  Player {playerId.substring(0, 6)}
                </div>
              </Html>
            </group>
          ))}

          {/* Environment lighting */}
          <Environment preset="city" />

          {/* Atmospheric effects based on mode */}
          {mode === "solo" && <Sparkles count={50} scale={40} size={2} speed={0.3} opacity={0.5} />}

          {mode === "trio" && <Stars radius={100} depth={50} count={1000} factor={4} />}

          {mode === "duo" && (
            <>
              <Cloud position={[10, 15, -10]} speed={0.2} opacity={0.5} />
              <Cloud position={[-10, 10, 10]} speed={0.1} opacity={0.3} />
            </>
          )}

          {/* Third-person camera */}
          <ThirdPersonCamera />
        </Canvas>
      </div>

      {/* Debug overlay */}
      <DebugOverlay />
    </>
  )
}
