"use client"

import { useRef, useState, useEffect, useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import type { Group, Object3D, Mesh } from "three"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface CharacterModelProps {
  characterId: string
  onError?: () => void
  isMoving?: boolean
  direction?: THREE.Vector3
  position?: [number, number, number]
}

// Define valid character IDs
type CharacterId = "default" | "char1" | "char2" | "char3" | "char4" | "char5" | "char6" | "char7" | "char8"

// Map of character IDs to their file paths
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
  char8: "/assets/3d/BodyBlock.fbx", // Body Blocker
  // Add more characters here as you create them
}

// Helper function to determine if a file is an FBX file
function isFbxFile(path: string): boolean {
  return path.toLowerCase().endsWith(".fbx")
}

export function CharacterModel({
  characterId = "default",
  onError,
  isMoving = false,
  direction,
  position = [0, 0, 0],
}: CharacterModelProps) {
  const groupRef = useRef<Group>(null)
  const [hasError, setHasError] = useState(false)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const clockRef = useRef(new THREE.Clock())
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const animationsRef = useRef<{
    idle: THREE.AnimationAction | null
    walking: THREE.AnimationAction | null
    flying: THREE.AnimationAction | null
  }>({
    idle: null,
    walking: null,
    flying: null,
  })
  const [currentAnimation, setCurrentAnimation] = useState<string>("idle")

  // Get the model path for this character, defaulting to the default model for safety
  const modelPath = CHARACTER_MODELS[characterId as CharacterId] || CHARACTER_MODELS.default

  // Check if this is an FBX file
  const isFbx = useMemo(() => isFbxFile(modelPath), [modelPath])

  // Only use useGLTF for GLB/GLTF files
  const { scene: gltfScene } = useGLTF(isFbx ? "/assets/3d/67fceb28cde84e5e1b093c66.glb" : modelPath)

  // Handle GLB/GLTF models
  useEffect(() => {
    if (isFbx) return // Skip for FBX files

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
          setIsLoading(false)
        } catch (error) {
          console.error("Error processing model materials:", error)
          // Continue anyway - the model might still render
          setModel(gltfModel)
          setIsLoading(false)
        }
      }
    } catch (error) {
      console.error("Error in CharacterModel component:", error)
      setHasError(true)
      setIsLoading(false)
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
  }, [characterId, isFbx, gltfScene, onError])

  // Handle FBX models
  useEffect(() => {
    if (!isFbx) return // Skip for GLB/GLTF files

    setIsLoading(true)

    // Dynamically import the FBXLoader
    const loadFbxModel = async () => {
      try {
        // Import the FBXLoader dynamically
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")
        const loader = new FBXLoader()

        loader.load(
          modelPath,
          (fbxModel) => {
            // Create a new mixer for the FBX model
            const mixer = new THREE.AnimationMixer(fbxModel)
            mixerRef.current = mixer

            // If the model has animations, use them
            if (fbxModel.animations && fbxModel.animations.length > 0) {
              const idleAction = mixer.clipAction(fbxModel.animations[0])
              idleAction.play()
            }

            // Ensure the model is visible from all angles
            fbxModel.traverse((node: Object3D) => {
              if ((node as Mesh).isMesh && (node as Mesh).material) {
                const mesh = node as Mesh
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    mat.side = THREE.DoubleSide
                  })
                } else {
                  mesh.material.side = THREE.DoubleSide
                }
                mesh.castShadow = true
                mesh.receiveShadow = true
              }
            })

            setModel(fbxModel)
            setIsLoading(false)
            setHasError(false)
          },
          // Progress callback
          (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded")
          },
          // Error callback
          (error) => {
            console.error("Error loading FBX model:", error)
            setHasError(true)
            setIsLoading(false)
            if (onError) onError()
          },
        )
      } catch (error) {
        console.error("Error importing FBXLoader:", error)
        setHasError(true)
        setIsLoading(false)
        if (onError) onError()
      }
    }

    loadFbxModel()

    // No cleanup needed here as it's handled by the component unmount
  }, [isFbx, modelPath, onError])

  // Load animations for GLB models
  useEffect(() => {
    let isMounted = true

    const loadAnimations = async () => {
      if (!model || isFbx) return

      try {
        // Import the FBXLoader dynamically
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")

        if (!isMounted || !model) return

        const mixer = new THREE.AnimationMixer(model)
        mixerRef.current = mixer

        const fbxLoader = new FBXLoader()

        // Load the idle animation
        fbxLoader.load("/assets/animations/idle.fbx", (fbx) => {
          if (!isMounted || !mixer) return

          if (fbx.animations && fbx.animations.length > 0) {
            const idleAction = mixer.clipAction(fbx.animations[0])
            animationsRef.current.idle = idleAction

            // Start with idle animation
            idleAction.play()
          }
        })

        // Load the walking animation
        fbxLoader.load("/assets/animations/walking.fbx", (fbx) => {
          if (!isMounted || !mixer) return

          if (fbx.animations && fbx.animations.length > 0) {
            const walkAction = mixer.clipAction(fbx.animations[0])
            animationsRef.current.walking = walkAction
          }
        })

        // Load the flying animation
        fbxLoader.load("/assets/animations/flying.fbx", (fbx) => {
          if (!isMounted || !mixer) return

          if (fbx.animations && fbx.animations.length > 0) {
            const flyAction = mixer.clipAction(fbx.animations[0])
            animationsRef.current.flying = flyAction
          }
        })
      } catch (error) {
        console.error("Error loading animations:", error)
      }
    }

    if (model && !isFbx) {
      loadAnimations()
    }

    return () => {
      isMounted = false
    }
  }, [model, isFbx])

  // Update animation based on movement state
  useEffect(() => {
    // Skip if no mixer or model
    if (!mixerRef.current || !model) return

    // Determine which animation to play based on character and movement
    let newAnimation = "idle"

    if (isMoving) {
      // Flying characters
      if (["char6", "char7", "char8"].includes(characterId)) {
        newAnimation = "flying"
      }
      // Regular walking characters
      else {
        newAnimation = "walking"
      }
    }

    // Only change animation if it's different
    if (newAnimation !== currentAnimation) {
      // Fade out current animation
      const currentAnim = animationsRef.current[currentAnimation as keyof typeof animationsRef.current]
      if (currentAnim) {
        currentAnim.fadeOut(0.5)
      }

      // Fade in new animation
      const newAnim = animationsRef.current[newAnimation as keyof typeof animationsRef.current]
      if (newAnim) {
        newAnim.reset().fadeIn(0.5).play()
        setCurrentAnimation(newAnimation)
      } else {
        // Fallback to idle if the animation isn't loaded
        const idleAnim = animationsRef.current.idle
        if (idleAnim) {
          idleAnim.reset().fadeIn(0.5).play()
          setCurrentAnimation("idle")
        }
      }
    }
  }, [isMoving, characterId, model, currentAnimation, isFbx])

  // Animation update loop for FBX models
  useFrame(() => {
    if (mixerRef.current) {
      const delta = clockRef.current.getDelta()
      mixerRef.current.update(delta)
    }
  })

  // Rotate model based on direction
  useEffect(() => {
    if (groupRef.current && direction && direction.length() > 0) {
      const targetRotation = Math.atan2(direction.x, direction.z)
      groupRef.current.rotation.y = targetRotation
    }
  }, [direction])

  // Create a simple placeholder model for when loading fails
  if (hasError || (!model && !isLoading)) {
    return (
      <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
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

  // If still loading, show a simple loading indicator
  if (isLoading && !model) {
    return (
      <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.25]} />
          <meshStandardMaterial color="#a855f7" wireframe />
        </mesh>
      </group>
    )
  }

  // Flying characters should be positioned slightly higher
  const yOffset = ["char6", "char7", "char8"].includes(characterId) && isMoving ? 0.5 : 0
  const finalPosition: [number, number, number] = [position[0], position[1] + yOffset, position[2]]

  return (
    <group ref={groupRef} position={finalPosition} rotation={[0, Math.PI, 0]}>
      {model && <primitive object={model} scale={isFbx ? 0.01 : 0.5} />}
    </group>
  )
}

// Try to preload GLB models, but don't crash if it fails
try {
  useGLTF.preload("/assets/3d/67fceb28cde84e5e1b093c66.glb")
  useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a.glb")
  useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb")
  // Note: We don't preload FBX files with useGLTF
} catch (error) {
  console.error("Error preloading models:", error)
  // Continue anyway - preloading is just an optimization
}
