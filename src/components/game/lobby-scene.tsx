"use client"

import { useEffect, useState, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { CharacterModel } from "@/components/game/character-model"
import type { Group } from "three"
import * as THREE from "three"
import { ErrorBoundary } from "react-error-boundary"

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

// Character with animation
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
      <CharacterModel characterId={characterId} />
    </group>
  )
}

// Add a moving light to create dynamic shadows
function MovingLight() {
  const lightRef = useRef<THREE.SpotLight>(null)

  useFrame((state) => {
    if (lightRef.current) {
      const angle = state.clock.getElapsedTime() * 0.5
      const radius = 5
      lightRef.current.position.x = Math.cos(angle) * radius
      lightRef.current.position.z = Math.sin(angle) * radius
      lightRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime()) * 0.5

      // Make the light always look at the character
      lightRef.current.target.position.set(0, 0, 0)
      lightRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <spotLight
      ref={lightRef}
      position={[5, 3, 0]}
      intensity={0.6}
      color="#ffffff"
      angle={0.5}
      penumbra={0.6}
      castShadow
      distance={10}
    >
      <primitive object={new THREE.Object3D()} attach="target" />
    </spotLight>
  )
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

// Main lobby environment
function LobbyEnvironment() {
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

      {/* Character - Now using the selected character from localStorage */}
      <AnimatedCharacter characterId={selectedCharacter} />
    </>
  )
}

// Main exported component
export function LobbyScene() {
  return (
    <div className="w-full h-full absolute inset-0">
      <ErrorBoundary FallbackComponent={SceneErrorFallback}>
        <Canvas shadows>
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
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
