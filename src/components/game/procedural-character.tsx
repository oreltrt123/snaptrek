"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { Group, Bone } from "three"

interface ProceduralCharacterProps {
  modelUrl: string
  position?: THREE.Vector3
  rotation?: number
  moving?: boolean
  running?: boolean
  onLoad?: () => void
}

export function ProceduralCharacter({
  modelUrl,
  position = new THREE.Vector3(0, 0, 0),
  rotation = 0,
  moving = false,
  running = false,
  onLoad,
}: ProceduralCharacterProps) {
  const groupRef = useRef<Group>(null)
  const bonesRef = useRef<Bone[]>([])
  const initialPositionsRef = useRef<Map<string, THREE.Vector3>>(new Map())

  // Load the GLB model
  const { scene, animations } = useGLTF(modelUrl)

  // Clone the scene to avoid sharing issues
  const model = scene.clone()

  // Find all bones and store their initial positions
  useEffect(() => {
    if (model) {
      const bones: Bone[] = []

      model.traverse((object) => {
        if (object instanceof THREE.Bone) {
          bones.push(object)
          initialPositionsRef.current.set(object.name, object.position.clone())
        }
      })

      bonesRef.current = bones

      if (onLoad) onLoad()
    }
  }, [model, onLoad])

  // Update position and rotation
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(position)
      groupRef.current.rotation.y = rotation
    }
  }, [position, rotation])

  // Procedural animation
  useFrame((state) => {
    if (!groupRef.current || bonesRef.current.length === 0) return

    const time = state.clock.getElapsedTime()
    const bones = bonesRef.current
    const initialPositions = initialPositionsRef.current

    // Find specific bones for animation
    const spine = bones.find((bone) => bone.name.toLowerCase().includes("spine"))
    const leftLeg = bones.find(
      (bone) => bone.name.toLowerCase().includes("leg") && bone.name.toLowerCase().includes("left"),
    )
    const rightLeg = bones.find(
      (bone) => bone.name.toLowerCase().includes("leg") && bone.name.toLowerCase().includes("right"),
    )
    const leftArm = bones.find(
      (bone) => bone.name.toLowerCase().includes("arm") && bone.name.toLowerCase().includes("left"),
    )
    const rightArm = bones.find(
      (bone) => bone.name.toLowerCase().includes("arm") && bone.name.toLowerCase().includes("right"),
    )

    // Reset all bones to initial position
    bones.forEach((bone) => {
      const initialPos = initialPositions.get(bone.name)
      if (initialPos) {
        bone.position.copy(initialPos)
      }
    })

    if (moving) {
      // Walking/running animation
      const speed = running ? 10 : 5
      const intensity = running ? 0.2 : 0.1

      // Leg movement
      if (leftLeg && rightLeg) {
        leftLeg.rotation.x = Math.sin(time * speed) * intensity
        rightLeg.rotation.x = Math.sin(time * speed + Math.PI) * intensity
      }

      // Arm movement
      if (leftArm && rightArm) {
        leftArm.rotation.x = Math.sin(time * speed + Math.PI) * intensity
        rightArm.rotation.x = Math.sin(time * speed) * intensity
      }

      // Subtle body movement
      if (spine) {
        spine.rotation.y = Math.sin(time * speed * 0.5) * 0.05
      }
    } else {
      // Idle animation - gentle breathing
      if (spine) {
        spine.position.y = (initialPositions.get(spine.name)?.y || 0) + Math.sin(time * 1.5) * 0.01
      }
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* The character model */}
      <primitive object={model} scale={1.0} />
    </group>
  )
}
