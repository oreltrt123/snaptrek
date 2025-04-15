"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useKeyboardControls } from "@react-three/drei"
import { CharacterModel } from "./character-model"
import * as THREE from "three"
import type { Group } from "three"

interface GameCharacterProps {
  characterId: string
  positionRef?: React.MutableRefObject<THREE.Vector3>
}

export function GameCharacter({ characterId, positionRef }: GameCharacterProps) {
  const characterRef = useRef<Group>(null)
  const [subscribeKeys] = useKeyboardControls()
  const [moveState, setMoveState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    running: false,
  })

  // Animation state
  const [animationState, setAnimationState] = useState("idle")
  const walkCycleRef = useRef(0)
  const localPositionRef = useRef(new THREE.Vector3(0, 0, 0))
  const rotationRef = useRef(0)

  // Subscribe to keyboard controls
  useEffect(() => {
    // The subscribeKeys function expects only a callback function
    return subscribeKeys((state) => {
      setMoveState({
        forward: state.forward,
        backward: state.backward,
        left: state.left,
        right: state.right,
        running: state.shift || false,
      })

      // Update animation state
      if (state.forward || state.backward || state.left || state.right) {
        setAnimationState(state.shift ? "running" : "walking")
      } else {
        setAnimationState("idle")
      }
    })
  }, [subscribeKeys])

  // Character movement and animation
  useFrame((state, delta) => {
    if (!characterRef.current) return

    const { forward, backward, left, right, running } = moveState
    const speed = running ? 5 : 2.5

    // Calculate movement direction
    const direction = new THREE.Vector3()

    if (forward) direction.z -= 1
    if (backward) direction.z += 1
    if (left) direction.x -= 1
    if (right) direction.x += 1

    // Normalize direction vector
    if (direction.length() > 0) {
      direction.normalize()

      // Apply speed
      direction.multiplyScalar(speed * delta)

      // Move character
      localPositionRef.current.x += direction.x
      localPositionRef.current.z += direction.z

      // Apply position to the character
      characterRef.current.position.x = localPositionRef.current.x
      characterRef.current.position.z = localPositionRef.current.z

      // Update the external position ref if provided
      if (positionRef) {
        positionRef.current.copy(characterRef.current.position)
      }

      // Rotate character to face movement direction
      if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z)
        rotationRef.current = angle
        characterRef.current.rotation.y = angle
      }
    }

    // Update walk cycle for animation
    if (animationState === "walking" || animationState === "running") {
      walkCycleRef.current += delta * (animationState === "running" ? 15 : 10)
    }

    // Apply idle animation when not moving
    if (animationState === "idle") {
      const idleMovement = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.05
      characterRef.current.position.y = idleMovement
    }
  })

  return (
    <group ref={characterRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
      {/* Add a debug sphere to ensure character is visible */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.2} />
      </mesh>

      {/* Make the character model larger and ensure it's visible */}
      <group scale={[2, 2, 2]}>
        <CharacterModel characterId={characterId} />
      </group>
    </group>
  )
}
