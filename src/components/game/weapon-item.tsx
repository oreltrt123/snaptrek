"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"

interface WeaponItemProps {
  type: string
  position: [number, number, number]
}

export function WeaponItem({ type, position }: WeaponItemProps) {
  const groupRef = useRef<Group>(null)
  const [hover, setHover] = useState(false)

  // Floating animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Gentle floating motion
      groupRef.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.1

      // Slow rotation
      groupRef.current.rotation.y += 0.01
    }
  })

  // Render different weapon types
  const renderWeapon = () => {
    switch (type.toLowerCase()) {
      case "sword":
        return (
          <group ref={groupRef} position={position} scale={[0.8, 0.8, 0.8]}>
            {/* Handle */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Guard */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <boxGeometry args={[0.3, 0.05, 0.05]} />
              <meshStandardMaterial color="#FFD700" />
            </mesh>

            {/* Blade */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <boxGeometry args={[0.1, 0.9, 0.02]} />
              <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Glow effect when hovering */}
            {hover && <pointLight position={[0, 0.5, 0]} distance={1} intensity={0.5} color="#ffffff" />}
          </group>
        )

      case "axe":
        return (
          <group ref={groupRef} position={position} scale={[0.8, 0.8, 0.8]}>
            {/* Handle */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>

            {/* Axe head */}
            <mesh position={[0.3, 0.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <coneGeometry args={[0.25, 0.5, 4]} />
              <meshStandardMaterial color="#708090" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Glow effect when hovering */}
            {hover && <pointLight position={[0, 0.5, 0]} distance={1} intensity={0.5} color="#ff0000" />}
          </group>
        )

      case "staff":
        return (
          <group ref={groupRef} position={position} scale={[0.8, 0.8, 0.8]}>
            {/* Staff body */}
            <mesh position={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
              <meshStandardMaterial color="#4B3621" />
            </mesh>

            {/* Orb */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#9370DB" emissive="#9370DB" emissiveIntensity={0.5} toneMapped={false} />
            </mesh>

            {/* Glow effect when hovering */}
            {hover && <pointLight position={[0, 0.8, 0]} distance={2} intensity={1} color="#9370DB" />}
          </group>
        )

      default:
        return (
          <group ref={groupRef} position={position}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.2, 1]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
          </group>
        )
    }
  }

  return (
    <group onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
      {renderWeapon()}
    </group>
  )
}
