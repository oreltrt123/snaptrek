"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import { useState, Suspense, useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"

// Dynamically import the CharacterModel component
import { CharacterModel } from "@/components/game/character-model"

interface CharacterViewerProps {
  modelPath: string
}

// Camera adjustment component for the detail view
function CameraAdjust() {
  const { camera } = useThree()

  useEffect(() => {
    // Position camera to focus more on upper body and face
    camera.position.set(0, 0, 2.5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Extract character ID from model path - MUST match the IDs in CHARACTER_MODELS
function getCharacterIdFromPath(modelPath: string): string {
  if (modelPath.includes("67fceb28cde84e5e1b093c66")) {
    // For all characters using this model, we'll use the path to determine which one
    if (modelPath.includes("char1")) return "char1"
    if (modelPath.includes("char2")) return "char2"
    if (modelPath.includes("char3")) return "char3"
    if (modelPath.includes("char4")) return "char4"
    if (modelPath.includes("char5")) return "char5"
    return "default"
  }
  if (modelPath.includes("67fd09ffe6ca40145d1c2b8a.glb")) return "char6"
  if (modelPath.includes("67fd09ffe6ca40145d1c2b8a2.glb")) return "char7"
  // Add more character model paths as needed
  return "default"
}

// Fallback model when loading fails
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

// Error fallback for the 3D scene
function SceneErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 text-white p-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">3D Preview Unavailable</h3>
        <p className="text-sm text-gray-300">
          Your browser may not support WebGL or there was an error loading the 3D model.
        </p>
      </div>
    </div>
  )
}

export function CharacterViewer({ modelPath }: CharacterViewerProps) {
  const [hasError, setHasError] = useState(false)
  const characterId = getCharacterIdFromPath(modelPath)

  console.log("CharacterViewer - Model path:", modelPath)
  console.log("CharacterViewer - Character ID:", characterId)

  return (
    <ErrorBoundary FallbackComponent={SceneErrorFallback}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 2.5]} fov={40} />
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Suspense fallback={<ModelFallback />}>
          {!hasError ? (
            // Position the model much lower and make it larger for better visibility
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
    </ErrorBoundary>
  )
}
