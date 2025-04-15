"use client"

import { useRef, useState, useEffect } from "react"
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
  const [hasError, setHasError] = useState(false)
  const [model, setModel] = useState<THREE.Group | null>(null)

  // Get the model path for this character, defaulting to the default model for safety
  const modelPath = CHARACTER_MODELS[characterId as CharacterId] || CHARACTER_MODELS.default

  // Use useGLTF unconditionally, but only update the model when the path changes
  const { scene: gltfScene, nodes, materials } = useGLTF(modelPath)

  useEffect(() => {
    let gltfModel: THREE.Group | null = null

    try {
      if (gltfScene) {
        // Clone the scene to avoid sharing issues
        gltfModel = gltfScene.clone()

        // Ensure the model is visible from all angles by setting material properties
        try {
          gltfModel.traverse((node: Object3D) => {
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
          setModel(gltfModel)
        } catch (error) {
          console.error("Error processing model materials:", error)
          // Continue anyway - the model might still render
          setModel(gltfModel)
        }
      }
    } catch (error) {
      console.error("Error in CharacterModel component:", error)
      setHasError(true)
      if (onError) onError()
    }

    return () => {
      // Cleanup function to dispose of the model when the component unmounts
      if (gltfModel) {
        gltfModel.traverse((object: any) => {
          if (object.isMesh) {
            object.geometry.dispose()
            if (object.material.isMaterial) {
              object.material.dispose()
            } else {
              // an array of materials
              object.material.forEach((material: any) => material.dispose())
            }
          }
        })
      }
    }
  }, [characterId, modelPath, onError, gltfScene])

  useEffect(() => {
    if (!gltfScene) {
      setHasError(true)
      if (onError) onError()
    } else {
      setHasError(false)
    }
  }, [gltfScene, onError])

  // Create a simple placeholder model for when loading fails
  if (hasError || !model) {
    return (
      <group ref={modelRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.25]} />
          <meshStandardMaterial color="#6d28d9" />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={modelRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      <primitive object={model} scale={0.5} />
    </group>
  )
}

// Try to preload models, but don't crash if it fails
try {
  useGLTF.preload("/assets/3d/67fceb28cde84e5e1b093c66.glb")
  // Add more preloads as you add more characters
} catch (error) {
  console.error("Error preloading models:", error)
  // Continue anyway - preloading is just an optimization
}
