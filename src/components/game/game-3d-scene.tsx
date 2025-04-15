"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"
import { ErrorBoundary } from "react-error-boundary"

// Simple character component with direct movement
function PlayerCharacter({ characterId = "default" }) {
  const { scene } = useGLTF(CHARACTER_MODELS[characterId] || CHARACTER_MODELS.default)
  const characterRef = useRef<THREE.Group>(null)
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [rotation, setRotation] = useState(0)
  const keysPressed = useRef<{ [key: string]: boolean }>({})

  // Set up keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Handle movement directly in the frame update
  useFrame((_, delta) => {
    if (!characterRef.current) return

    const moveSpeed = keysPressed.current["ShiftLeft"] ? 5 * delta : 2 * delta
    const newPosition = position.clone()
    let newRotation = rotation
    let moved = false

    // Forward/backward movement
    if (keysPressed.current["KeyW"] || keysPressed.current["ArrowUp"]) {
      newPosition.x += Math.sin(rotation) * moveSpeed
      newPosition.z += Math.cos(rotation) * moveSpeed
      moved = true
    }

    if (keysPressed.current["KeyS"] || keysPressed.current["ArrowDown"]) {
      newPosition.x -= Math.sin(rotation) * moveSpeed
      newPosition.z -= Math.cos(rotation) * moveSpeed
      moved = true
    }

    // Left/right rotation
    if (keysPressed.current["KeyA"] || keysPressed.current["ArrowLeft"]) {
      newRotation += 2 * delta
      moved = true
    }

    if (keysPressed.current["KeyD"] || keysPressed.current["ArrowRight"]) {
      newRotation -= 2 * delta
      moved = true
    }

    // Update position and rotation
    if (moved) {
      setPosition(newPosition)
      setRotation(newRotation)

      // Log movement for debugging
      console.log("Character moved:", newPosition, newRotation)

      // Dispatch custom event for movement debug
      const event = new CustomEvent("character-moved", {
        detail: { position: newPosition, rotation: newRotation },
      })
      window.dispatchEvent(event)
    }

    // Apply position and rotation to the character
    characterRef.current.position.copy(newPosition)
    characterRef.current.rotation.y = newRotation
  })

  // Clone the model to avoid sharing issues
  const model = scene.clone()

  return (
    <group ref={characterRef} position={position} rotation={[0, rotation, 0]}>
      {/* The character model */}
      <primitive object={model} scale={0.5} />
    </group>
  )
}

// Map of character IDs to their GLB file paths
const CHARACTER_MODELS = {
  default: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
  char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
}

// Preload all models
Object.values(CHARACTER_MODELS).forEach((path) => {
  useGLTF.preload(path)
})

// Ground plane
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4c1d95" />
      <gridHelper args={[100, 100, "#9333ea", "#9333ea"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <lineBasicMaterial attach="material" color="#9333ea" transparent opacity={0.4} />
      </gridHelper>
    </mesh>
  )
}

// Camera that follows the player
function FollowCamera() {
  const { camera } = useThree()
  const [target] = useState(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    camera.position.set(0, 5, 10)
    camera.lookAt(target)
  }, [camera, target])

  return null
}

// Error fallback
function SceneErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">3D Scene Unavailable</h3>
        <p className="text-sm text-gray-300">
          Your browser may not support WebGL or there was an error loading the 3D scene.
        </p>
      </div>
    </div>
  )
}

// Main component
export default function Game3DScene({ mode, userId }: { mode: string; userId: string }) {
  const [selectedCharacter, setSelectedCharacter] = useState("default")

  // Load the selected character from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCharacter = localStorage.getItem("selectedCharacter")
      if (storedCharacter) {
        console.log("Loading character from localStorage:", storedCharacter)
        setSelectedCharacter(storedCharacter)
      }
    }
  }, [])

  return (
    <ErrorBoundary FallbackComponent={SceneErrorFallback}>
      <Canvas shadows>
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Ground */}
        <Ground />

        {/* Player Character with direct movement */}
        <PlayerCharacter characterId={selectedCharacter} />

        {/* Camera */}
        <FollowCamera />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </ErrorBoundary>
  )
}

// Import missing dependencies
import { useGLTF } from "@react-three/drei"
