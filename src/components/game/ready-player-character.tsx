"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { Group } from "three"

interface ReadyPlayerCharacterProps {
  characterId: string
  position?: THREE.Vector3
  rotation?: number
  onLoad?: () => void
  onError?: () => void
}

// Map of character IDs to their GLB file paths
// IMPORTANT: This mapping must be consistent across the entire application
const CHARACTER_MODELS: Record<string, string> = {
  default: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Default character
  char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Shadow Warrior
  char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Cyber Knight
  char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Mystic Mage
  char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Neon Assassin
  char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb", // Void Walker
  char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb", // Cosmic Wanderer
  char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb", // Astral Nomad
}

export function ReadyPlayerCharacter({
  characterId,
  position = new THREE.Vector3(0, 0, 0),
  rotation = 0,
  onLoad,
  onError,
}: ReadyPlayerCharacterProps) {
  const groupRef = useRef<Group>(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  // Get the model path for this character
  const modelPath = CHARACTER_MODELS[characterId] || CHARACTER_MODELS.default

  // Load the GLB model
  const { scene, animations } = useGLTF(modelPath, undefined, undefined, (error) => {
    console.error("Error loading GLB:", error)
    if (onError) onError()
  })

  // Clone the scene to avoid sharing issues
  const model = scene.clone()

  // Set up the model when it's loaded
  useEffect(() => {
    if (model) {
      console.log("Model loaded:", characterId)

      // Ensure the model is visible from all angles
      model.traverse((node: THREE.Object3D) => {
        if ((node as THREE.Mesh).isMesh) {
          const mesh = node as THREE.Mesh
          if (mesh.material) {
            // Make sure materials are double-sided
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((mat) => {
                mat.side = THREE.DoubleSide
              })
            } else {
              mesh.material.side = THREE.DoubleSide
            }

            // Ensure materials have proper shadows
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        }
      })

      setModelLoaded(true)
      if (onLoad) onLoad()
    }
  }, [model, characterId, onLoad])

  // Update position and rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position)
      groupRef.current.rotation.y = rotation
    }
  }, [position, rotation])

  // Add a simple animation if no animations are available
  useFrame((state) => {
    if (groupRef.current && !animations.length) {
      // Gentle idle animation
      const time = state.clock.getElapsedTime()
      groupRef.current.position.y = position.y + Math.sin(time * 1.5) * 0.05
    }
  })

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
