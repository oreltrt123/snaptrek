"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { AnimatedReadyPlayer } from "@/components/game/animated-ready-player"
import * as THREE from "three"

// Animation test scene
export default function AnimationTestScene({ characterId }: { characterId: string }) {
  const [animationState, setAnimationState] = useState({
    moving: false,
    running: false,
  })

  // Cycle through animation states
  useEffect(() => {
    const animationCycle = [
      { moving: false, running: false }, // Idle
      { moving: true, running: false }, // Walking
      { moving: true, running: true }, // Running
    ]

    let currentIndex = 0

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % animationCycle.length
      setAnimationState(animationCycle[currentIndex])
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Canvas shadows>
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      {/* Character with animation */}
      <AnimatedReadyPlayer
        characterId={characterId}
        position={new THREE.Vector3(0, 0, 0)}
        moving={animationState.moving}
        running={animationState.running}
      />

      {/* Environment and controls */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#4c1d95" />
      </mesh>

      <Environment preset="sunset" />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={5}
      />
    </Canvas>
  )
}
