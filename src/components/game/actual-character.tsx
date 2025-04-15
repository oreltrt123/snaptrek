"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Sphere } from "@react-three/drei"
import type { Group } from "three"

// This is a separate component we can test with
export function ActualCharacter() {
  const group = useRef<Group>(null)
  const boxRef = useRef<Group>(null)
  const modelRef = useRef<Group>(null)

  // Set up a simple animation
  useFrame(() => {
    if (modelRef.current) {
      // Gentle rotation
      modelRef.current.rotation.y += 0.005
    }

    if (boxRef.current) {
      // Rotate the box too
      boxRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={group} position={[0, 0, 0]}>
      {/* Debug box to confirm positioning */}
      <group ref={boxRef} position={[0, 0.3, 0]}>
        <Box args={[0.2, 0.2, 0.2]}>
          <meshStandardMaterial color="#ff00ff" />
        </Box>
      </group>

      {/* Placeholder character model */}
      <group ref={modelRef} position={[0, 0.2, 0]} rotation={[0, Math.PI, 0]}>
        <Box args={[0.5, 1, 0.25]} position={[0, 0.5, 0]} scale={0.2}>
          <meshStandardMaterial color="#6d28d9" />
        </Box>
        <Sphere args={[0.25, 16, 16]} position={[0, 1, 0]} scale={0.2}>
          <meshStandardMaterial color="#8b5cf6" />
        </Sphere>
      </group>
    </group>
  )
}
