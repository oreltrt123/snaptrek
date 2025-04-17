"use client"

import { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface BodyBlockCharacterProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
  isMoving?: boolean
  direction?: THREE.Vector3
}

export function BodyBlockCharacter({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.01,
  isMoving = false,
  direction,
}: BodyBlockCharacterProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null)
  const [animation, setAnimation] = useState<THREE.AnimationAction | null>(null)
  const clockRef = useRef(new THREE.Clock())

  // Load the FBX model
  useEffect(() => {
    let isMounted = true

    const loadModel = async () => {
      try {
        // Dynamically import the FBXLoader
        const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js")
        const loader = new FBXLoader()

        // Load the model
        loader.load(
          "/assets/3d/BodyBlock.fbx",
          (fbxModel) => {
            if (!isMounted) return

            // Set up materials
            fbxModel.traverse((node: THREE.Object3D) => {
              if ((node as THREE.Mesh).isMesh && (node as THREE.Mesh).material) {
                const mesh = node as THREE.Mesh

                // Make materials double-sided
                if (Array.isArray(mesh.material)) {
                  mesh.material.forEach((mat) => {
                    mat.side = THREE.DoubleSide
                  })
                } else {
                  mesh.material.side = THREE.DoubleSide
                }

                // Set up shadows
                mesh.castShadow = true
                mesh.receiveShadow = true
              }
            })

            // Create animation mixer
            const newMixer = new THREE.AnimationMixer(fbxModel)
            setMixer(newMixer)

            // Set up animation if available
            if (fbxModel.animations && fbxModel.animations.length > 0) {
              const action = newMixer.clipAction(fbxModel.animations[0])
              action.play()
              setAnimation(action)
            }

            // Set the model
            setModel(fbxModel)
          },
          undefined,
          (error) => {
            console.error("Error loading BodyBlock model:", error)
          },
        )
      } catch (error) {
        console.error("Error importing FBXLoader:", error)
      }
    }

    loadModel()

    return () => {
      isMounted = false
    }
  }, [])

  // Update animation
  useFrame(() => {
    if (mixer) {
      const delta = clockRef.current.getDelta()
      mixer.update(delta)
    }
  })

  // Rotate model based on direction
  useEffect(() => {
    if (groupRef.current && direction && direction.length() > 0) {
      const targetRotation = Math.atan2(direction.x, direction.z)
      groupRef.current.rotation.y = targetRotation
    }
  }, [direction])

  return (
    <group
      ref={groupRef}
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    >
      {model && <primitive object={model} />}
    </group>
  )
}
