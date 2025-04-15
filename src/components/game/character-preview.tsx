"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { useState, Suspense, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the CharacterModel component with SSR disabled
const CharacterModel = dynamic(() => import("./character-model").then((mod) => ({ default: mod.CharacterModel })), {
  ssr: false,
})

interface CharacterPreviewProps {
  characterId: string
}

// Camera adjustment component
function CameraAdjust() {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera to focus more on upper body and face
    camera.position.set(0, 0, 2.5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Fallback component when model loading fails
function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 0.5]} />
      <meshStandardMaterial color="#6d28d9" />
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#8b5cf6" />
      </mesh>
    </mesh>
  )
}

export function CharacterPreview({ characterId }: CharacterPreviewProps) {
  const [hasError, setHasError] = useState(false)

  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={40} />
      <ambientLight intensity={0.7} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      <Suspense fallback={<ModelFallback />}>
        {!hasError ? (
          // Position the model much lower and make it larger
          <group position={[0, -1.5, 0]} scale={1.2}>
            <CharacterModel characterId={characterId} onError={() => setHasError(true)} />
          </group>
        ) : (
          <ModelFallback />
        )}
      </Suspense>

      <CameraAdjust />
      <Environment preset="sunset" />
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        minDistance={2}
        maxDistance={5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}
