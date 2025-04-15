"use client"

import { useRef } from "react"
import { useGLTF } from "@react-three/drei"
import type { Group, Object3D, Mesh } from "three"
import * as THREE from "three"

interface CharacterModelProps {
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
  // Add more characters here as you create them
}

export function CharacterModel({ characterId, onError }: CharacterModelProps) {
  const modelRef = useRef<Group>(null)

  // Get the model path for this character
  const modelPath = CHARACTER_MODELS[characterId as CharacterId] || CHARACTER_MODELS.default

  // Load the GLB model
  const { scene } = useGLTF(modelPath, undefined, undefined, (error) => {
    console.error("Error loading GLB:", error)
    if (onError) onError()
  })

  // Clone the scene to avoid sharing issues
  const model = scene.clone()

  // Ensure the model is visible from all angles by setting material properties
  model.traverse((node: Object3D) => {
    // Check if the node is a Mesh using type assertion
    const mesh = node as Mesh
    if (mesh.isMesh && mesh.material) {
      // Now TypeScript knows this is a mesh with material
      // Make sure materials are double-sided
      if (Array.isArray(mesh.material)) {
        // Handle array of materials
        mesh.material.forEach((mat) => {
          mat.side = THREE.DoubleSide
        })
      } else {
        // Handle single material
        mesh.material.side = THREE.DoubleSide
      }

      // Ensure materials have proper shadows
      mesh.castShadow = true
      mesh.receiveShadow = true
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
// Add more preloads as you add more characters
