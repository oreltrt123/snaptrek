"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface GameMapProps {
  mapType: string
}

export function GameMap({ mapType }: GameMapProps) {
  const mapRef = useRef<THREE.Group>(null)

  // Different map configurations based on type
  const getMapConfig = () => {
    switch (mapType) {
      case "arena":
        return {
          groundColor: "#4c1d95",
          groundSize: 50,
          wallColor: "#7e22ce",
          ambientColor: "#a855f7",
        }
      case "forest":
        return {
          groundColor: "#064e3b",
          groundSize: 60,
          wallColor: "#047857",
          ambientColor: "#10b981",
        }
      case "castle":
        return {
          groundColor: "#1e3a8a",
          groundSize: 70,
          wallColor: "#1e40af",
          ambientColor: "#3b82f6",
        }
      case "duel":
        return {
          groundColor: "#7f1d1d",
          groundSize: 30,
          wallColor: "#b91c1c",
          ambientColor: "#ef4444",
        }
      default:
        return {
          groundColor: "#4c1d95",
          groundSize: 50,
          wallColor: "#7e22ce",
          ambientColor: "#a855f7",
        }
    }
  }

  const config = getMapConfig()

  return (
    <group ref={mapRef}>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[config.groundSize, config.groundSize]} />
        <meshStandardMaterial color={config.groundColor} roughness={0.8} />
      </mesh>

      {/* Center platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[5, 5, 0.2, 32]} />
        <meshStandardMaterial color={config.ambientColor} emissive={config.ambientColor} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}
