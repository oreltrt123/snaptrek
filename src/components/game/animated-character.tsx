"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { CharacterModel } from "./character-model"
import type { Group } from "three"

interface AnimatedCharacterProps {
  characterId: string
}

export function AnimatedCharacter({ characterId }: AnimatedCharacterProps) {
  const groupRef = useRef<Group>(null)

  // Simple idle animation
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle swaying motion
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1

      // Breathing animation - subtle up and down movement
      const breathingOffset = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.02
      groupRef.current.position.y = -1.5 + breathingOffset

      // Subtle side-to-side weight shifting
      const swayOffset = Math.sin(state.clock.getElapsedTime() * 0.7) * 0.03
      groupRef.current.position.x = swayOffset
    }
  })

  return (
    <group ref={groupRef} position={[0, -1.5, 0]} scale={1.2}>
      <CharacterModel characterId={characterId} />
    </group>
  )
}