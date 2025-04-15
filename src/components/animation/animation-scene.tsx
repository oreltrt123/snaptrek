"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { CharacterModel } from "@/components/game/character-model"
import type { Group } from "three"

// Enhanced animated character component for the test page
function AnimatedTestCharacter({ characterId }: { characterId: string }) {
  const groupRef = useRef<Group>(null)
  const timeRef = useRef(0)
  const [animationType, setAnimationType] = useState<"rotate" | "bob" | "dance" | "idle">("rotate")

  // Cycle through animation types every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationType((prev) => {
        switch (prev) {
          case "rotate":
            return "bob"
          case "bob":
            return "dance"
          case "dance":
            return "idle"
          case "idle":
            return "rotate"
          default:
            return "rotate"
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Enhanced animations with multiple types
  useFrame((state, delta) => {
    if (!groupRef.current) return

    timeRef.current += delta

    switch (animationType) {
      case "rotate":
        // Simple rotation
        groupRef.current.rotation.y += delta * 1.5
        groupRef.current.position.y = -1
        groupRef.current.rotation.x = 0
        groupRef.current.rotation.z = 0
        break

      case "bob":
        // Bobbing up and down
        groupRef.current.position.y = -1 + Math.sin(timeRef.current * 3) * 0.3
        groupRef.current.rotation.y += delta * 0.2
        groupRef.current.rotation.x = 0
        groupRef.current.rotation.z = 0
        break

      case "dance":
        // Dancing-like movement
        groupRef.current.position.y = -1 + Math.abs(Math.sin(timeRef.current * 5)) * 0.2
        groupRef.current.rotation.y += delta * 2
        groupRef.current.position.x = Math.sin(timeRef.current * 4) * 0.3
        groupRef.current.rotation.z = Math.sin(timeRef.current * 3) * 0.2
        break

      case "idle":
      default:
        // Subtle idle animation
        groupRef.current.position.y = -1 + Math.sin(timeRef.current * 1.5) * 0.05
        groupRef.current.rotation.y += delta * 0.1
        groupRef.current.rotation.z = Math.sin(timeRef.current * 0.7) * 0.05
        break
    }
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]} scale={1.2}>
      <CharacterModel characterId={characterId} />
    </group>
  )
}

// Main scene component
export default function AnimationScene({ characterId }: { characterId: string }) {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      {/* Character with enhanced animation */}
      <AnimatedTestCharacter characterId={characterId} />

      <Environment preset="sunset" />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={5}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
