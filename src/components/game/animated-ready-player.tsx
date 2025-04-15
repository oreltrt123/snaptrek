"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, useAnimations } from "@react-three/drei"
import * as THREE from "three"
import type { Group } from "three"

interface AnimatedReadyPlayerProps {
  characterId: string
  position?: THREE.Vector3
  rotation?: number
  animation?: string
  moving?: boolean
  running?: boolean
  onLoad?: () => void
  onError?: () => void
}

// Map of character IDs to their GLB file paths
const CHARACTER_MODELS: Record<string, string> = {
  default: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
  char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
}

// Animation states
const ANIMATIONS = {
  IDLE: "idle",
  WALKING: "walking",
  RUNNING: "running",
}

export function AnimatedReadyPlayer({
  characterId,
  position = new THREE.Vector3(0, 0, 0),
  rotation = 0,
  moving = false,
  running = false,
  onLoad,
  onError,
}: AnimatedReadyPlayerProps) {
  const groupRef = useRef<Group>(null)
  const [currentAnimation, setCurrentAnimation] = useState(ANIMATIONS.IDLE)

  // Get the model path for this character
  const modelPath = CHARACTER_MODELS[characterId] || CHARACTER_MODELS.default

  // Load the GLB model
  const { scene, animations } = useGLTF(modelPath)

  // Load animations
  const { actions, mixer } = useAnimations(animations, groupRef)

  // Update position and rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position)
      groupRef.current.rotation.y = rotation
    }
  }, [position, rotation])

  // Update animation based on movement state
  useEffect(() => {
    let newAnimation = ANIMATIONS.IDLE

    if (moving) {
      newAnimation = running ? ANIMATIONS.RUNNING : ANIMATIONS.WALKING
    }

    if (newAnimation !== currentAnimation) {
      setCurrentAnimation(newAnimation)
    }
  }, [moving, running, currentAnimation])

  // Play the current animation
  useEffect(() => {
    // If we have animations from the model, use them
    if (actions && Object.keys(actions).length > 0) {
      // Stop all animations
      Object.values(actions).forEach((action) => action.stop())

      // Find the appropriate animation
      let animationToPlay = actions[currentAnimation]

      // Fallback to any available animation if the specific one isn't found
      if (!animationToPlay && Object.values(actions).length > 0) {
        animationToPlay = Object.values(actions)[0]
      }

      // Play the animation if available
      if (animationToPlay) {
        animationToPlay.reset().fadeIn(0.5).play()
      }
    }
  }, [actions, currentAnimation])

  // Procedural animation fallback when no animations are available
  useFrame((state) => {
    if (groupRef.current && (!animations || animations.length === 0)) {
      const time = state.clock.getElapsedTime()

      if (currentAnimation === ANIMATIONS.IDLE) {
        // Gentle breathing animation
        groupRef.current.position.y = position.y + Math.sin(time * 1.5) * 0.05
      } else if (currentAnimation === ANIMATIONS.WALKING) {
        // Simple walking animation
        groupRef.current.position.y = position.y + Math.abs(Math.sin(time * 5)) * 0.1
      } else if (currentAnimation === ANIMATIONS.RUNNING) {
        // More pronounced running animation
        groupRef.current.position.y = position.y + Math.abs(Math.sin(time * 10)) * 0.15
      }
    }
  })

  // Clone the scene to avoid sharing issues
  const model = scene.clone()

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Debug sphere to show character position */}
      <mesh position={[0, 1, 0]} visible={false}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* The actual character model */}
      <primitive object={model} scale={0.5} />
    </group>
  )
}

// Preload all models to avoid loading issues
Object.values(CHARACTER_MODELS).forEach((path) => {
  useGLTF.preload(path)
})
