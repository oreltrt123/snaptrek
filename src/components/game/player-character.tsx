"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { CharacterModel } from "./character-model"
import * as THREE from "three"

interface PlayerCharacterProps {
  characterId: string
  playerRef: React.MutableRefObject<THREE.Object3D>
}

export function PlayerCharacter({ characterId, playerRef }: PlayerCharacterProps) {
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 0))
  const [rotation, setRotation] = useState(0)
  const characterRef = useRef<THREE.Group>(null)
  const speed = useRef(5)

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveDistance = 0.5 // Fixed movement distance per keypress

      const newPosition = position.clone()
      let newRotation = rotation

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          newPosition.z -= moveDistance
          newRotation = Math.PI
          break
        case "s":
        case "arrowdown":
          newPosition.z += moveDistance
          newRotation = 0
          break
        case "a":
        case "arrowleft":
          newPosition.x -= moveDistance
          newRotation = Math.PI / 2
          break
        case "d":
        case "arrowright":
          newPosition.x += moveDistance
          newRotation = -Math.PI / 2
          break
        case "shift":
          speed.current = 10
          break
      }

      setPosition(newPosition)
      setRotation(newRotation)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "shift") {
        speed.current = 5
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [position, rotation])

  // Update the player reference position
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.copy(position)
      playerRef.current.rotation.y = rotation
    }
  }, [position, rotation, playerRef])

  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]} ref={characterRef}>
      {/* Use the actual character model from the locker */}
      <group scale={[2, 2, 2]}>
        <CharacterModel characterId={characterId} />
      </group>

      {/* Optional: Add a small debug sphere to show the character's position */}
      <mesh position={[0, 3, 0]} visible={false}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ff00ff" />
      </mesh>
    </group>
  )
}
