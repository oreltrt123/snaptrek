"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"
import * as THREE from "three"

interface CharacterModelWithAnimationProps {
  characterId: string
  onError?: () => void
}

// Define valid character IDs
type CharacterId = "default" | "char1" | "char2" | "char3" | "char4" | "char5" | "char6" | "char7"

// Map of character IDs to their GLB file paths
// IMPORTANT: This mapping must be consistent across the entire application
const CHARACTER_MODELS: Record<CharacterId, string> = {
  default: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Default character
  char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Shadow Warrior
  char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Cyber Knight
  char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Mystic Mage
  char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Neon Assassin
  char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Void Walker
  char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb", // Cosmic Wanderer
  char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb", // Astral Nomad
}

export function CharacterModelWithAnimation({ characterId, onError }: CharacterModelWithAnimationProps) {
  const modelRef = useRef<Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)

  // Get the model path for this character
  const modelPath = CHARACTER_MODELS[characterId as CharacterId] || CHARACTER_MODELS.default

  // Load the GLB model
  const { scene, animations } = useGLTF(modelPath, undefined, undefined, (error) => {
    console.error("Error loading GLB:", error)
    if (onError) onError()
  })

  // Clone the scene to avoid sharing issues
  const model = scene.clone()

  // Set up animation mixer
  useEffect(() => {
    if (model && animations.length > 0) {
      // Create a new animation mixer
      const mixer = new THREE.AnimationMixer(model)
      mixerRef.current = mixer

      // Play the first animation by default (usually idle)
      const action = mixer.clipAction(animations[0])
      action.play()

      return () => {
        // Clean up
        mixer.stopAllAction()
      }
    }
  }, [model, animations])

  // Update animations in the render loop
  useFrame((state, delta) => {
    // Update the animation mixer on each frame
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    // Add a gentle rotation for models without animations
    if (modelRef.current && (!mixerRef.current || animations.length === 0)) {
      modelRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={modelRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      <primitive object={model} scale={0.5} />
    </group>
  )
}

// Preload all models to avoid loading issues
useGLTF.preload("/assets/3d/67fceb28cde84e5e1b093c66.glb")
useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a.glb")
useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb")
