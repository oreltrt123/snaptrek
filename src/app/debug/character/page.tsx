"use client"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { CharacterModel } from "@/components/game/character-model"

export default function CharacterDebugPage() {
  const [characterId, setCharacterId] = useState("char8")
  const [isMoving, setIsMoving] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch debug info
  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch("/api/debug/character")
        if (response.ok) {
          const data = await response.json()
          setDebugInfo(data)
        } else {
          setError("Failed to fetch debug info")
        }
      } catch (error) {
        setError("Error fetching debug info")
        console.error(error)
      }
    }

    fetchDebugInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Character Debug</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">Controls</h2>
            <div className="mb-4">
              <label className="block mb-2">Character ID:</label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
              >
                <option value="default">Default</option>
                <option value="char1">Shadow Warrior (char1)</option>
                <option value="char2">Cyber Knight (char2)</option>
                <option value="char3">Mystic Mage (char3)</option>
                <option value="char4">Neon Assassin (char4)</option>
                <option value="char5">Void Walker (char5)</option>
                <option value="char6">Cosmic Wanderer (char6)</option>
                <option value="char7">Astral Nomad (char7)</option>
                <option value="char8">Body Blocker (char8)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Animation:</label>
              <div className="flex items-center">
                <button
                  className={`px-4 py-2 rounded mr-2 ${isMoving ? "bg-gray-700" : "bg-purple-600"}`}
                  onClick={() => setIsMoving(false)}
                >
                  Idle
                </button>
                <button
                  className={`px-4 py-2 rounded ${isMoving ? "bg-purple-600" : "bg-gray-700"}`}
                  onClick={() => setIsMoving(true)}
                >
                  Walking
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : debugInfo ? (
              <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(debugInfo, null, 2)}</pre>
            ) : (
              <div>Loading debug info...</div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: "500px" }}>
          <Canvas camera={{ position: [0, 1.5, 3] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <CharacterModel
              characterId={characterId}
              isMoving={isMoving}
              onError={() => setError("Failed to load character model")}
            />
            <OrbitControls />
            <gridHelper args={[10, 10]} />
          </Canvas>
        </div>
      </div>

      <div className="mt-4 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Current Settings</h2>
        <div>Character ID: {characterId}</div>
        <div>Animation: {isMoving ? "Walking" : "Idle"}</div>
        <div>Model Path: {debugInfo?.characters?.[characterId] || "Unknown"}</div>
      </div>
    </div>
  )
}
