"use client"

import React, { Suspense } from "react"
import { useEffect, useState, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import type { Group } from "three"
import * as THREE from "three"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"

// Dynamically import the CharacterModel component with SSR disabled
const CharacterModel = dynamic(() => import("./character-model").then((mod) => ({ default: mod.CharacterModel })), {
  ssr: false,
})

// Circular platform for the character to stand on
function Platform() {
  const platformRef = useRef<THREE.Mesh>(null)

  // Add subtle animation to the platform
  useFrame((state) => {
    if (platformRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.02
      platformRef.current.scale.set(scale, 1, scale)
    }
  })

  return (
    <mesh ref={platformRef} position={[0, 0, 0]} receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
      <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

// Background environment
function BackgroundEnvironment() {
  return (
    <>
      {/* Background plane */}
      <mesh position={[0, 5, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#4c1d95" emissive="#a855f7" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3b0764" roughness={0.8} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[40, 40, "#9333ea", "#9333ea"]} position={[0, -0.05, 0]}>
        <lineBasicMaterial attach="material" color="#9333ea" transparent opacity={0.4} />
      </gridHelper>
    </>
  )
}

// Scene setup with camera adjustment
function SceneSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Adjust camera position to see the character better - focus more on upper body
    camera.position.set(0, 0.5, 3.5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Character with ENHANCED animation
function AnimatedCharacter({ characterId }: { characterId: string }) {
  const groupRef = useRef<Group>(null)
  const rotationRef = useRef(0)
  const timeRef = useRef(0)

  // Enhanced idle animation with more noticeable movements
  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta

      // 1. Continuous rotation - make the character slowly turn around
      rotationRef.current += delta * 0.2 // Slow rotation
      groupRef.current.rotation.y = rotationRef.current

      // 2. Bobbing up and down - more pronounced
      const bobHeight = Math.sin(timeRef.current * 1.5) * 0.1
      groupRef.current.position.y = -1.5 + bobHeight

      // 3. Slight leaning/swaying
      const leanAmount = Math.sin(timeRef.current * 0.7) * 0.1
      groupRef.current.rotation.z = leanAmount * 0.2

      // 4. Subtle scaling/breathing effect
      const breathScale = 1 + Math.sin(timeRef.current * 2) * 0.02
      groupRef.current.scale.set(1.2 * breathScale, 1.2 * breathScale, 1.2 * breathScale)
    }
  })

  return (
    <group ref={groupRef} position={[0, -1.5, 0]} scale={1.2}>
      <Suspense fallback={<SimplePlaceholder />}>
        <CharacterModel characterId={characterId} />
      </Suspense>
    </group>
  )
}

// Simple placeholder for when the character model is loading
function SimplePlaceholder() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 0.25]} />
        <meshStandardMaterial color="#6d28d9" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
    </group>
  )
}

// Add a moving light to create dynamic shadows
function MovingLight() {
  const lightRef = useRef<THREE.SpotLight>(null)
  const targetRef = useRef<THREE.Object3D>(new THREE.Object3D())

  useEffect(() => {
    // Set up the target object
    if (targetRef.current) {
      targetRef.current.position.set(0, 0, 0)
    }
  }, [])

  useFrame((state) => {
    if (lightRef.current) {
      const angle = state.clock.getElapsedTime() * 0.5
      const radius = 5
      lightRef.current.position.x = Math.cos(angle) * radius
      lightRef.current.position.z = Math.sin(angle) * radius
      lightRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime()) * 0.5

      // Make sure the target is updated
      if (targetRef.current) {
        targetRef.current.updateMatrixWorld()
      }
    }
  })

  return (
    <>
      <primitive object={targetRef.current} />
      <spotLight
        ref={lightRef}
        position={[5, 3, 0]}
        intensity={0.6}
        color="#ffffff"
        angle={0.5}
        penumbra={0.6}
        castShadow
        distance={10}
        target={targetRef.current}
      />
    </>
  )
}

// Fallback component for when the 3D scene fails to load
function SceneErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8">
      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-6 max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">3D Scene Error</h2>
        <p className="mb-4">
          We encountered an issue loading the 3D scene. This might be due to your browser or device not supporting
          WebGL.
        </p>
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

// Main lobby environment
function LobbyEnvironment() {
  const [selectedCharacter, setSelectedCharacter] = useState("default")

  // Load the selected character from localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedCharacter = localStorage.getItem("selectedCharacter")
        if (storedCharacter) {
          setSelectedCharacter(storedCharacter)
        }
      }
    } catch (error) {
      console.error("Error loading character from localStorage:", error)
      // Fallback to default character
      setSelectedCharacter("default")
    }
  }, [])

  return (
    <>
      {/* Camera setup */}
      <SceneSetup />

      {/* Lighting - Enhanced for better visual effect */}
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 3, 3]} intensity={1.2} color="#ffffff" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[3, 3, 0]} intensity={0.8} color="#a855f7" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[-3, 3, 0]} intensity={0.8} color="#3b82f6" angle={0.6} penumbra={0.5} castShadow />

      {/* Moving light for dynamic shadows */}
      <MovingLight />

      {/* Background */}
      <BackgroundEnvironment />

      {/* Platform */}
      <Platform />

      {/* Character */}
      <AnimatedCharacter characterId={selectedCharacter} />
    </>
  )
}

// Main exported component - using React.memo to prevent unnecessary re-renders
export const LobbySceneWithCharacter = React.memo(function LobbySceneWithCharacterInner() {
  return (
    <div className="w-full h-full absolute inset-0">
      <ErrorBoundary FallbackComponent={SceneErrorFallback}>
        <Canvas shadows>
          <Suspense fallback={null}>
            <LobbyEnvironment />
            <Environment preset="night" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.2}
              minAzimuthAngle={-Math.PI / 4}
              maxAzimuthAngle={Math.PI / 4}
              enableDamping
              dampingFactor={0.05}
              target={[0, 0, 0]} // Look at the character's center
              autoRotate={false} // Disable auto-rotation since we're rotating the character
            />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
})
