"use client"

import { useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Box, Sphere } from "@react-three/drei"

// Circular platform for the character to stand on
function Platform() {
  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
      <meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

// Simple placeholder character
function PlaceholderCharacter() {
  return (
    <group position={[0, 0.2, 0]} rotation={[0, Math.PI, 0]}>
      <Box args={[0.5, 1, 0.25]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#6d28d9" />
      </Box>
      <Sphere args={[0.25, 16, 16]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#8b5cf6" />
      </Sphere>
    </group>
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
    // Adjust camera position to see the character and platform properly
    camera.position.set(0, 1.0, 3.5)
    camera.lookAt(0, 0.2, 0)
  }, [camera])

  return null
}

// Main lobby environment
function LobbyEnvironment() {
  return (
    <>
      {/* Camera setup */}
      <SceneSetup />

      {/* Lighting */}
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 3, 3]} intensity={1} color="#ffffff" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[3, 3, 0]} intensity={0.8} color="#a855f7" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[-3, 3, 0]} intensity={0.8} color="#3b82f6" angle={0.6} penumbra={0.5} castShadow />

      {/* Background */}
      <BackgroundEnvironment />

      {/* Platform */}
      <Platform />

      {/* Character */}
      <PlaceholderCharacter />
    </>
  )
}

export function LobbyScene() {
  // We don't need the state or effect at all since we're not using the selectedCharacter
  // and we're not passing it to any child components

  return (
    <div className="w-full h-full absolute inset-0">
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
          target={[0, 0.2, 0]} // Look at the character's center
        />
      </Canvas>
    </div>
  )
}
