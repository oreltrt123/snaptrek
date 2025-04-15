"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { ProceduralCharacter } from "./procedural-character"
import * as THREE from "three"

interface AnimationSceneProps {
  characterUrl: string
  moving?: boolean
  running?: boolean
}

export default function AnimationScene({ characterUrl, moving = false, running = false }: AnimationSceneProps) {
  return (
    <Canvas shadows camera={{ position: [0, 1.5, 3], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      {/* Character with animation */}
      <ProceduralCharacter
        modelUrl={characterUrl}
        position={new THREE.Vector3(0, 0, 0)}
        moving={moving}
        running={running}
      />

      {/* Environment */}
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
