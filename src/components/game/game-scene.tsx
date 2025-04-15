"use client"

import { useRef, useEffect, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { GameMap } from "./game-map"
import { PlayerCharacter } from "./player-character"
import * as THREE from "three"

interface GameSceneProps {
  mode: string
  characterId?: string
}

// Camera that follows the player
function FollowCamera() {
  const { camera } = useThree()

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 10, 20)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

export function GameScene({ mode, characterId = "default" }: GameSceneProps) {
  const playerRef = useRef(new THREE.Object3D())
  const [mapType, setMapType] = useState("arena")
  const [actualCharacterId, setActualCharacterId] = useState(characterId)

  // Load the selected character from localStorage if not provided
  useEffect(() => {
    if (characterId === "default" && typeof window !== "undefined") {
      const storedCharacter = localStorage.getItem("selectedCharacter")
      if (storedCharacter) {
        setActualCharacterId(storedCharacter)
      }
    }
  }, [characterId])

  // Set map type based on game mode
  useEffect(() => {
    switch (mode) {
      case "solo":
        setMapType("arena")
        break
      case "duo":
        setMapType("forest")
        break
      case "trio":
        setMapType("castle")
        break
      case "duel":
        setMapType("duel")
        break
      default:
        setMapType("arena")
    }
  }, [mode])

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        {/* Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-10, 10, 5]} intensity={0.5} castShadow />

        {/* Game Map */}
        <GameMap mapType={mapType} />

        {/* Player Character - using the actual character model from the locker */}
        <PlayerCharacter characterId={actualCharacterId} playerRef={playerRef} />

        {/* Camera */}
        <FollowCamera />

        {/* Environment */}
        <Environment preset="sunset" />

        {/* Allow manual camera control for testing */}
        <OrbitControls />
      </Canvas>
    </div>
  )
}
