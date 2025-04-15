"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, KeyboardControls, useKeyboardControls } from "@react-three/drei"
import * as THREE from "three"
import { CharacterModel } from "./character-model"
import { ErrorBoundary } from "react-error-boundary"

// Define keyboard controls
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["ShiftLeft"] },
]

// Character controller with WASD movement
function CharacterController({ characterId = "default" }) {
  const characterRef = useRef<THREE.Group>(null)
  const [, get] = useKeyboardControls()
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [rotation, setRotation] = useState(0)
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())

  // Handle character movement
  useFrame((state, delta) => {
    if (!characterRef.current) return

    // Get keyboard state
    const { forward, backward, left, right, run } = get()

    // Calculate movement speed
    const speed = run ? 5 : 2.5
    const moveSpeed = speed * delta

    // Reset direction
    direction.current.set(0, 0, 0)

    // Set direction based on keys
    if (forward) direction.current.z = -1
    if (backward) direction.current.z = 1
    if (left) direction.current.x = -1
    if (right) direction.current.x = 1

    // Normalize direction vector
    if (direction.current.length() > 0) {
      direction.current.normalize()

      // Calculate new position
      const newPosition = position.clone()
      newPosition.x += direction.current.x * moveSpeed
      newPosition.z += direction.current.z * moveSpeed

      // Update position
      setPosition(newPosition)

      // Calculate rotation to face movement direction
      if (direction.current.x !== 0 || direction.current.z !== 0) {
        const angle = Math.atan2(direction.current.x, direction.current.z)
        setRotation(angle)
      }
    }

    // Apply position and rotation to character
    characterRef.current.position.copy(position)
    characterRef.current.rotation.y = rotation
  })

  return (
    <group ref={characterRef} position={[0, 0, 0]}>
      {/* Character model */}
      <group scale={[1.5, 1.5, 1.5]}>
        <CharacterModel characterId={characterId} />
      </group>
    </group>
  )
}

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

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 5, 10)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Error fallback for the 3D scene
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

// Main game scene component
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
      <KeyboardControls map={keyboardMap}>
        <Canvas shadows>
          {/* Lighting */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {/* Environment */}
          <Environment preset="sunset" />

          {/* Ground */}
          <Ground />

          {/* Character with WASD controls */}
          <CharacterController characterId={selectedCharacter} />

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
      </KeyboardControls>
    </ErrorBoundary>
  )
}
