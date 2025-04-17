"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import type { Group } from "three"

interface ReadyPlayerCharacterProps {
  url: string
  position?: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
  onLoad?: () => void
}

export const ReadyPlayerCharacter = forwardRef<Group, ReadyPlayerCharacterProps>(
  ({ url, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0], onLoad }, ref) => {
    const groupRef = useRef<Group>(null)
    const { scene } = useGLTF(url)

    // Forward the ref to parent components
    useImperativeHandle(ref, () => groupRef.current!)

    useEffect(() => {
      if (groupRef.current && onLoad) {
        onLoad()
      }
    }, [groupRef, onLoad])

    return (
      <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
        <primitive object={scene.clone()} />
      </group>
    )
  },
)

ReadyPlayerCharacter.displayName = "ReadyPlayerCharacter"
