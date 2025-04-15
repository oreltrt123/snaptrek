"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { CharacterModel } from "@/components/game/character-model"
import type { Group } from "three"
import * as THREE from "three"
import { ErrorBoundary } from "react-error-boundary"

// Platform for a character
function CharacterPlatform({
  position = [0, 0, 0],
  scale = 1,
  isActive = true,
  children,
}: {
  position?: [number, number, number]
  scale?: number
  isActive?: boolean
  children?: React.ReactNode
}) {
  const platformRef = useRef<THREE.Mesh>(null)

  // Add subtle animation to the platform
  useFrame((state) => {
    if (platformRef.current && isActive) {
      // Gentle pulsing effect
      const pulseScale = 1 + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.02
      platformRef.current.scale.set(scale * pulseScale, 1, scale * pulseScale)
    }
  })

  return (
    <group position={new THREE.Vector3(...position)}>
      <mesh ref={platformRef} position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[0.8 * scale, 0.8 * scale, 0.1, 32]} />
        <meshStandardMaterial
          color={isActive ? "#a855f7" : "#6b21a8"}
          metalness={0.6}
          roughness={0.2}
          opacity={isActive ? 1 : 0.7}
          transparent={!isActive}
        />
      </mesh>
      {children}
    </group>
  )
}

// Add a plus button above a platform
function PlusButton({ position, onClick }: { position: [number, number, number]; onClick: () => void }) {
  const groupRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current) {
      // Hover animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
      groupRef.current.rotation.y += 0.01

      // Scale effect on hover
      const targetScale = hovered ? 1.2 : 1
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
    }
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      // Make the hitbox larger for easier clicking
      scale={1}
    >
      <mesh>
        <boxGeometry args={[0.3, 0.08, 0.08]} />
        <meshStandardMaterial
          color={hovered ? "#34d399" : "#10b981"}
          emissive={hovered ? "#34d399" : "#10b981"}
          emissiveIntensity={hovered ? 0.8 : 0.5}
        />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.3, 0.08, 0.08]} />
        <meshStandardMaterial
          color={hovered ? "#34d399" : "#10b981"}
          emissive={hovered ? "#34d399" : "#10b981"}
          emissiveIntensity={hovered ? 0.8 : 0.5}
        />
      </mesh>
    </group>
  )
}

// Background environment
function BackgroundEnvironment() {
  return (
    <>
      {/* Background plane */}
      <mesh position={[0, 5, -10]} rotation={[0, 0, 0]}>
        <planeGeometry args={[40, 20]} />
        <meshStandardMaterial color="#4c1d95" emissive="#a855f7" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#3b0764" roughness={0.8} />
      </mesh>

      {/* Grid */}
      <gridHelper args={[40, 40, "#9333ea", "#9333ea"]} position={[0, -0.05, 0]}>
        <lineBasicMaterial attach="material" color="#9333ea" transparent opacity={0.4} />
      </gridHelper>
    </>
  )
}

// Scene setup with camera adjustment
function SceneSetup() {
  const { camera } = useThree()

  useEffect(() => {
    // Adjust camera position to see all platforms
    camera.position.set(0, 1.5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return null
}

// Character with animation
function AnimatedCharacter({
  characterId,
  position = [0, 0, 0],
}: { characterId: string; position?: [number, number, number] }) {
  const groupRef = useRef<Group>(null)
  const timeRef = useRef(0)

  // Enhanced idle animation with more noticeable movements
  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta

      // Bobbing up and down - more pronounced
      const bobHeight = Math.sin(timeRef.current * 1.5) * 0.1
      groupRef.current.position.y = position[1] + bobHeight

      // Slight leaning/swaying
      const leanAmount = Math.sin(timeRef.current * 0.7) * 0.1
      groupRef.current.rotation.z = leanAmount * 0.2

      // Subtle scaling/breathing effect
      const breathScale = 1 + Math.sin(timeRef.current * 2) * 0.02
      groupRef.current.scale.set(1.2 * breathScale, 1.2 * breathScale, 1.2 * breathScale)
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]} scale={1.2}>
      <CharacterModel characterId={characterId} />
    </group>
  )
}

// Add a moving light to create dynamic shadows
function MovingLight() {
  const lightRef = useRef<THREE.SpotLight>(null)

  useFrame((state) => {
    if (lightRef.current) {
      const angle = state.clock.getElapsedTime() * 0.5
      const radius = 5
      lightRef.current.position.x = Math.cos(angle) * radius
      lightRef.current.position.z = Math.sin(angle) * radius
      lightRef.current.position.y = 3 + Math.sin(state.clock.getElapsedTime()) * 0.5

      // Make the light always look at the center
      lightRef.current.target.position.set(0, 0, 0)
      lightRef.current.target.updateMatrixWorld()
    }
  })

  return (
    <spotLight
      ref={lightRef}
      position={[5, 3, 0]}
      intensity={0.6}
      color="#ffffff"
      angle={0.5}
      penumbra={0.6}
      castShadow
      distance={10}
    >
      <primitive object={new THREE.Object3D()} attach="target" />
    </spotLight>
  )
}

// Error fallback for the 3D scene
function SceneErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-2">3D Scene Unavailable</h3>
        <p className="text-sm text-gray-300">
          Your browser may not support WebGL or there was an error loading the 3D scene.
        </p>
      </div>
    </div>
  )
}

// Raycaster for handling 3D object interactions
function InteractionHandler({
  onClickLeftPlatform,
  onClickRightPlatform,
  children,
}: {
  onClickLeftPlatform: () => void
  onClickRightPlatform: () => void
  children: React.ReactNode
}) {
  const { camera, raycaster, mouse, scene } = useThree()
  const leftPlusRef = useRef<Group>(null)
  const rightPlusRef = useRef<Group>(null)

  // Set up click handler
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Update the mouse position
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera)

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children, true)

      // Check if we clicked on a plus button
      for (let i = 0; i < intersects.length; i++) {
        let obj = intersects[i].object

        // Traverse up to find the group
        while (obj && obj.parent && obj.parent !== scene) {
          obj = obj.parent

          // Check if this is the left plus button
          if (obj.position.x < -1) {
            onClickLeftPlatform()
            return
          }

          // Check if this is the right plus button
          if (obj.position.x > 1) {
            onClickRightPlatform()
            return
          }
        }
      }
    }

    window.addEventListener("click", handleClick)
    return () => {
      window.removeEventListener("click", handleClick)
    }
  }, [camera, mouse, raycaster, scene, onClickLeftPlatform, onClickRightPlatform])

  return <>{children}</>
}

// Main lobby environment
function LobbyEnvironment({
  onClickLeftPlatform,
  onClickRightPlatform,
  members,
}: {
  onClickLeftPlatform: () => void
  onClickRightPlatform: () => void
  members: {
    position: number
    profiles: {
      id: string
      username: string
      avatar_url?: string
    }
  }[]
}) {
  const [selectedCharacter, setSelectedCharacter] = useState("default")

  // Find members by position
  const owner = members.find((m) => m.position === 0)?.profiles
  const leftMember = members.find((m) => m.position === 1)?.profiles
  const rightMember = members.find((m) => m.position === 2)?.profiles

  // Load the selected character from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCharacter = localStorage.getItem("selectedCharacter")
      if (storedCharacter) {
        console.log("Loading character from localStorage:", storedCharacter)
        setSelectedCharacter(storedCharacter)
      }
    }
  }, [])

  return (
    <InteractionHandler onClickLeftPlatform={onClickLeftPlatform} onClickRightPlatform={onClickRightPlatform}>
      {/* Camera setup */}
      <SceneSetup />

      {/* Lighting - Enhanced for better visual effect */}
      <ambientLight intensity={0.7} />
      <spotLight position={[0, 3, 3]} intensity={1.2} color="#ffffff" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[3, 3, 0]} intensity={0.8} color="#a855f7" angle={0.6} penumbra={0.5} castShadow />
      <spotLight position={[-3, 3, 0]} intensity={0.8} color="#3b82f6" angle={0.6} penumbra={0.5} castShadow />

      {/* Moving light for dynamic shadows */}
      <MovingLight />

      {/* Background */}
      <BackgroundEnvironment />

      {/* Main character platform (center) */}
      <CharacterPlatform position={[0, 0, 0]} scale={1} isActive={true}>
        <AnimatedCharacter characterId={selectedCharacter} position={[0, 0, 0]} />
      </CharacterPlatform>

      {/* Left character platform */}
      <CharacterPlatform position={[-2.5, 0, 0]} scale={0.9} isActive={!!leftMember}>
        {leftMember ? (
          <AnimatedCharacter characterId={leftMember.id} position={[-2.5, 0, 0]} />
        ) : (
          <PlusButton position={[-2.5, 1.5, 0]} onClick={onClickLeftPlatform} />
        )}
      </CharacterPlatform>

      {/* Right character platform */}
      <CharacterPlatform position={[2.5, 0, 0]} scale={0.9} isActive={!!rightMember}>
        {rightMember ? (
          <AnimatedCharacter characterId={rightMember.id} position={[2.5, 0, 0]} />
        ) : (
          <PlusButton position={[2.5, 1.5, 0]} onClick={onClickRightPlatform} />
        )}
      </CharacterPlatform>
    </InteractionHandler>
  )
}

// Main exported component
export function LobbyScene({
  onClickLeftPlatform,
  onClickRightPlatform,
  members = [],
}: {
  onClickLeftPlatform?: () => void
  onClickRightPlatform?: () => void
  members?: any[]
}) {
  return (
    <div className="w-full h-full absolute inset-0">
      <ErrorBoundary FallbackComponent={SceneErrorFallback}>
        <Canvas shadows>
          <LobbyEnvironment
            onClickLeftPlatform={onClickLeftPlatform || (() => {})}
            onClickRightPlatform={onClickRightPlatform || (() => {})}
            members={members}
          />
          <Environment preset="night" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            enableDamping
            dampingFactor={0.05}
            target={[0, 0, 0]} // Look at the center
            autoRotate={false}
          />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
