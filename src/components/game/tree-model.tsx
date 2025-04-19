"use client"

import { useRef } from "react"
import type { Group } from "three"

interface TreeModelProps {
  position: [number, number, number]
  scale?: number
  type?: string
}

export function TreeModel({ position, scale = 1, type = "oak" }: TreeModelProps) {
  const groupRef = useRef<Group>(null)

  // Simple tree model using basic shapes
  const renderSimpleTree = () => {
    const trunkColor = type === "oak" ? "#8B4513" : type === "pine" ? "#5E2605" : "#A0522D"
    const leavesColor = type === "oak" ? "#2E8B57" : type === "pine" ? "#006400" : "#7CFC00"

    if (type === "palm") {
      return (
        <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
          {/* Trunk */}
          <mesh position={[0, 2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 4, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>

          {/* Palm leaves */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i / 8) * Math.PI * 2
            const x = Math.cos(angle) * 1.5
            const z = Math.sin(angle) * 1.5

            return (
              <mesh
                key={`leaf-${i}`}
                position={[x * 0.7, 4, z * 0.7]}
                rotation={[Math.PI * 0.25, angle, Math.PI * 0.1]}
                castShadow
              >
                <boxGeometry args={[0.1, 2, 0.5]} />
                <meshStandardMaterial color="#7CFC00" />
              </mesh>
            )
          })}
        </group>
      )
    }

    if (type === "pine") {
      return (
        <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
            <meshStandardMaterial color={trunkColor} />
          </mesh>

          {/* Pine layers */}
          <mesh position={[0, 2.5, 0]} castShadow>
            <coneGeometry args={[1.5, 2, 8]} />
            <meshStandardMaterial color={leavesColor} />
          </mesh>

          <mesh position={[0, 3.5, 0]} castShadow>
            <coneGeometry args={[1.2, 1.5, 8]} />
            <meshStandardMaterial color={leavesColor} />
          </mesh>

          <mesh position={[0, 4.5, 0]} castShadow>
            <coneGeometry args={[0.8, 1.2, 8]} />
            <meshStandardMaterial color={leavesColor} />
          </mesh>
        </group>
      )
    }

    // Default oak tree
    return (
      <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
        {/* Trunk */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.4, 3, 8]} />
          <meshStandardMaterial color={trunkColor} />
        </mesh>

        {/* Leaves */}
        <mesh position={[0, 3.5, 0]} castShadow>
          <sphereGeometry args={[1.5, 8, 8]} />
          <meshStandardMaterial color={leavesColor} />
        </mesh>
      </group>
    )
  }

  return renderSimpleTree()
}
