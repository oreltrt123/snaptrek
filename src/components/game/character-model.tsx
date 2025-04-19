"use client"

import { useRef, useState, useEffect } from "react"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import type { Group } from "three"

// Define the props for the CharacterModel component
interface CharacterModelProps {
  characterId: string
  isMoving?: boolean
  isSprinting?: boolean
  isJumping?: boolean
  direction?: THREE.Vector3
  position?: [number, number, number]
  onError?: () => void
}

// Define valid character IDs and their model paths
const MODEL_PATHS: Record<string, string> = {
  default: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
  char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
  char8: "/assets/3d/BodyBlock.fbx",
  "body-blocker": "/assets/3d/BodyBlock.fbx",
  standarddle: "/assets/3d/Standarddle.fbx",
}

// Animation paths for Mixamo FBX models
const MIXAMO_ANIMATIONS = {
  idle: "/assets/animations/TalkingOnPhone.fbx",
  walking: "/assets/animations/CatwalkWalk.fbx",
  running: "/assets/animations/Running.fbx",
  jumping: "/assets/animations/Jumping.fbx",
}

export function CharacterModel({
  characterId = "default",
  isMoving = false,
  isSprinting = false,
  isJumping = false,
  direction,
  position = [0, 0, 0],
  onError,
}: CharacterModelProps) {
  const groupRef = useRef<Group>(null)
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [loadingState, setLoadingState] = useState<string>("initializing")
  const [fbxModel, setFbxModel] = useState<THREE.Group | null>(null)
  const [fbxAnimations, setFbxAnimations] = useState<Record<string, THREE.AnimationClip>>({})
  const [fbxLoaded, setFbxLoaded] = useState(false)
  const [jumpState, setJumpState] = useState({ isJumping: false, jumpTime: 0 })

  // Get the model path for this character, defaulting to the default model for safety
  const modelPath = MODEL_PATHS[characterId] || MODEL_PATHS.default

  // Determine if this is an FBX model
  const isFbxModel = modelPath.toLowerCase().endsWith(".fbx")

  // For GLB models, use useGLTF
  const { scene: gltfScene, animations: gltfAnimations } = useGLTF(
    !isFbxModel ? modelPath : "/assets/3d/67fceb28cde84e5e1b093c66.glb",
  )

  // Debug logging
  useEffect(() => {
    console.log(`CharacterModel: Loading character ${characterId}`)
    console.log(`CharacterModel: Model path ${modelPath}`)
    console.log(`CharacterModel: Is FBX model: ${isFbxModel}`)
  }, [characterId, modelPath, isFbxModel])

  // Load FBX model
  useEffect(() => {
    if (!isFbxModel) return

    let isMounted = true
    setLoadingState("loading-fbx-model")
    console.log(`Loading FBX model: ${modelPath} for character: ${characterId}`)

    const loadFbxModel = async () => {
      try {
        // Dynamic import for FBXLoader to avoid SSR issues
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")

        if (!isMounted) return

        const loader = new FBXLoader()

        loader.load(
          modelPath,
          (model) => {
            if (!isMounted) return

            console.log(`FBX model loaded successfully for ${characterId}`)
            setLoadingState("fbx-model-loaded")

            // Scale the model (FBX models are usually much larger)
            model.scale.set(0.01, 0.01, 0.01)

            // Store the model
            setFbxModel(model)

            // Create animation mixer
            const newMixer = new THREE.AnimationMixer(model)
            setMixer(newMixer)

            // Add the model to the group
            if (groupRef.current) {
              // Clear existing children
              while (groupRef.current.children.length > 0) {
                groupRef.current.remove(groupRef.current.children[0])
              }

              groupRef.current.add(model)
            }

            // Now load animations
            loadFbxAnimations(newMixer)
          },
          (progress) => {
            console.log(`Loading progress for ${characterId}: ${Math.round((progress.loaded / progress.total) * 100)}%`)
          },
          (loadError) => {
            console.error(`Error loading FBX model for ${characterId}:`, loadError)
            setError(true)
            setLoadingState(`error-loading-fbx: ${loadError.message}`)
            if (onError) onError()
          },
        )
      } catch (importError) {
        console.error(`Error importing FBXLoader for ${characterId}:`, importError)
        setError(true)
        setLoadingState(`error-importing-fbxloader: ${importError}`)
        if (onError) onError()
      }
    }

    loadFbxModel()

    return () => {
      isMounted = false
      if (mixer) {
        mixer.stopAllAction()
      }
    }
  }, [modelPath, isFbxModel, characterId, onError])

  // Load FBX animations
  const loadFbxAnimations = (newMixer: THREE.AnimationMixer) => {
    if (!newMixer) return

    setLoadingState("loading-fbx-animations")
    let isMounted = true

    const loadAnimation = async (path: string, name: string) => {
      try {
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")

        if (!isMounted) return

        const loader = new FBXLoader()
        console.log(`Loading animation: ${name} from ${path}`)

        loader.load(
          path,
          (animationScene) => {
            if (!isMounted || !newMixer) return

            if (animationScene.animations.length > 0) {
              const clip = animationScene.animations[0]
              clip.name = name

              // Store the animation
              setFbxAnimations((prev) => ({
                ...prev,
                [name]: clip,
              }))

              // Start with idle animation
              if (name === "idle") {
                const action = newMixer.clipAction(clip)
                action.play()
                setCurrentAnimation("idle")
              }

              // If we've loaded all animations, mark as complete
              if (Object.keys(fbxAnimations).length >= 3) {
                setLoadingState("fbx-animations-loaded")
                setFbxLoaded(true)
              }
            } else {
              console.warn(`No animations found in ${path}`)
            }
          },
          undefined,
          (error) => {
            console.error(`Error loading ${name} animation:`, error)
            setLoadingState(`error-loading-${name}-animation: ${error.message}`)
          },
        )
      } catch (error) {
        console.error(`Error importing FBXLoader for ${name} animation:`, error)
        setLoadingState(`error-importing-fbxloader-for-${name}: ${error}`)
      }
    }

    // Load all animations
    loadAnimation(MIXAMO_ANIMATIONS.idle, "idle")
    loadAnimation(MIXAMO_ANIMATIONS.walking, "walking")
    loadAnimation(MIXAMO_ANIMATIONS.running, "running")
    loadAnimation(MIXAMO_ANIMATIONS.jumping, "jumping")

    return () => {
      isMounted = false
    }
  }

  // Handle GLB model
  useEffect(() => {
    if (isFbxModel || !gltfScene) return

    console.log(`Setting up GLB model for ${characterId}`)

    // Clone the scene to avoid sharing issues
    const clonedScene = gltfScene.clone()

    // Add the model to the group
    if (groupRef.current) {
      // Clear existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0])
      }

      groupRef.current.add(clonedScene)
    }

    // Create animation mixer
    const newMixer = new THREE.AnimationMixer(clonedScene)
    setMixer(newMixer)

    // Process animations if available
    if (gltfAnimations && gltfAnimations.length > 0) {
      console.log(`GLB model has ${gltfAnimations.length} animations`)

      // Find idle and walking animations
      const idleAnim = gltfAnimations.find((a) => a.name.toLowerCase().includes("idle")) || gltfAnimations[0]
      const walkAnim = gltfAnimations.find((a) => a.name.toLowerCase().includes("walk")) || gltfAnimations[0]

      if (idleAnim) {
        const action = newMixer.clipAction(idleAnim)
        action.play()
        setCurrentAnimation("idle")
      }
    } else {
      console.log(`No animations found in GLB model for ${characterId}`)
    }

    return () => {
      if (newMixer) {
        newMixer.stopAllAction()
      }
    }
  }, [gltfScene, gltfAnimations, isFbxModel, characterId])

  // Handle jumping state
  useEffect(() => {
    if (isJumping && !jumpState.isJumping) {
      setJumpState({ isJumping: true, jumpTime: 0 })
    }
  }, [isJumping, jumpState.isJumping])

  // Handle animation changes based on movement
  useEffect(() => {
    if (!mixer) return

    let targetAnimation = "idle"

    if (jumpState.isJumping) {
      targetAnimation = "jumping"
    } else if (isMoving) {
      targetAnimation = isSprinting ? "running" : "walking"
    }

    // If we're already playing the target animation, do nothing
    if (currentAnimation === targetAnimation) return

    console.log(`Changing animation from ${currentAnimation} to ${targetAnimation} for ${characterId}`)

    if (isFbxModel) {
      // For FBX models, use the loaded animations
      if (!fbxAnimations[targetAnimation]) {
        console.warn(`Animation ${targetAnimation} not found for ${characterId}`)
        return
      }

      // Fade out current animation if any
      if (currentAnimation && fbxAnimations[currentAnimation]) {
        const current = mixer.clipAction(fbxAnimations[currentAnimation])
        current.fadeOut(0.2)
      }

      // Play the new animation
      const action = mixer.clipAction(fbxAnimations[targetAnimation])
      action.reset().fadeIn(0.2).play()
      setCurrentAnimation(targetAnimation)
    } else {
      // For GLB models, try to find animations by name
      if (gltfAnimations && gltfAnimations.length > 0) {
        let targetClip = null

        if (targetAnimation === "idle") {
          targetClip = gltfAnimations.find((a) => a.name.toLowerCase().includes("idle"))
        } else if (targetAnimation === "walking") {
          targetClip = gltfAnimations.find((a) => a.name.toLowerCase().includes("walk"))
        } else if (targetAnimation === "running") {
          targetClip = gltfAnimations.find((a) => a.name.toLowerCase().includes("run"))
        } else if (targetAnimation === "jumping") {
          targetClip = gltfAnimations.find((a) => a.name.toLowerCase().includes("jump"))
        }

        if (!targetClip) {
          console.warn(`Animation ${targetAnimation} not found in GLB for ${characterId}`)
          return
        }

        // Stop all current animations
        mixer.stopAllAction()

        // Play the new animation
        const action = mixer.clipAction(targetClip)
        action.reset().fadeIn(0.2).play()
        setCurrentAnimation(targetAnimation)
      }
    }
  }, [
    isMoving,
    isSprinting,
    jumpState.isJumping,
    mixer,
    fbxAnimations,
    gltfAnimations,
    currentAnimation,
    isFbxModel,
    characterId,
  ])

  // Update mixer on each frame and handle jump animation
  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta)
    }

    // Handle jump animation timing
    if (jumpState.isJumping) {
      const newJumpTime = jumpState.jumpTime + delta
      setJumpState((prev) => ({ ...prev, jumpTime: newJumpTime }))

      // End jump after 1 second
      if (newJumpTime > 1) {
        setJumpState({ isJumping: false, jumpTime: 0 })
      }

      // Apply jump height based on time (simple parabola)
      if (groupRef.current) {
        const jumpHeight = Math.sin(Math.PI * newJumpTime) * 1.5
        groupRef.current.position.y = jumpHeight
      }
    }

    // Rotate character to face movement direction
    if (groupRef.current && direction && isMoving) {
      const targetRotation = Math.atan2(direction.x, direction.z)
      groupRef.current.rotation.y = targetRotation
    }
  })

  // Create a simple placeholder model for when loading fails
  if (error) {
    return (
      <group position={position} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.25]} />
          <meshStandardMaterial color="#6d28d9" />
        </mesh>
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI, 0]}>
      {/* Debug text for loading state */}
      {loadingState !== "fbx-animations-loaded" && isFbxModel && (
        <mesh position={[0, 3, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color={loadingState.includes("error") ? "red" : "yellow"} />
        </mesh>
      )}
    </group>
  )
}

// Try to preload GLB models, but don't crash if it fails
try {
  useGLTF.preload("/assets/3d/67fceb28cde84e5e1b093c66.glb")
  useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a.glb")
  useGLTF.preload("/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb")
} catch (error) {
  console.error("Error preloading models:", error)
}
