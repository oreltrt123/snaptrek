"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { CharacterModel } from "./character-model"

interface CharacterPreviewProps {
  characterId: string
  showControls?: boolean
}

export function CharacterPreview({ characterId, showControls = true }: CharacterPreviewProps) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Suspense fallback={null}>
          <CharacterModel characterId={characterId} />
          <Environment preset="sunset" />
        </Suspense>
        {showControls && (
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={1.5}
            maxDistance={4}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
    </div>
  )
}

export default CharacterPreview
