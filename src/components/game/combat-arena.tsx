"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface CombatArenaProps {
  position: [number, number, number]
}

export function CombatArena({ position }: CombatArenaProps) {
  const arenaRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  // Animate the arena glow
  useFrame(({ clock }) => {
    if (glowRef.current) {
      // Pulsating glow effect
      glowRef.current.intensity = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.5
    }

    if (arenaRef.current) {
      // Subtle rotation
      arenaRef.current.rotation.y += 0.001
    }
  })

  return (
    <group position={position} ref={arenaRef}>
      {/* Arena floor */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#8a3a3a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Arena border */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <ringGeometry args={[7.8, 8, 32]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* Arena center marker */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ff0000" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Arena glow */}
      <pointLight ref={glowRef} position={[0, 0.5, 0]} distance={16} intensity={1.5} color="#ff6666" />

      {/* Arena pillars */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 8
        const z = Math.sin(angle) * 8

        return (
          <group key={`pillar-${i}`} position={[x, 0, z]}>
            <mesh position={[0, 1.5, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
              <meshStandardMaterial color="#8a3a3a" />
            </mesh>

            <mesh position={[0, 3.2, 0]} castShadow>
              <boxGeometry args={[0.8, 0.4, 0.8]} />
              <meshStandardMaterial color="#c0c0c0" />
            </mesh>

            {/* Torch fire */}
            <mesh position={[0, 3.5, 0]} castShadow>
              <coneGeometry args={[0.2, 0.4, 8]} />
              <meshStandardMaterial color="#ff6600" emissive="#ff6600" emissiveIntensity={1} toneMapped={false} />
            </mesh>

            <pointLight position={[0, 3.5, 0]} distance={5} intensity={0.8} color="#ff6600" />
          </group>
        )
      })}
    </group>
  )
}
