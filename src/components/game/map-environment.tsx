"use client"

import { Grid, Sky } from "@react-three/drei"

interface MapEnvironmentProps {
  mode: string
  terrain?: string
  skyPreset?: string
}

export function MapEnvironment({ mode, terrain = "default", skyPreset = "sunset" }: MapEnvironmentProps) {
  // Set floor color and texture based on terrain type
  const getFloorProps = () => {
    switch (terrain) {
      case "forest":
        return {
          color: "#2e4c2e",
          gridColor: "#1a2e1a",
          sectionColor: "#3a5a3a",
        }
      case "desert":
        return {
          color: "#c2b280",
          gridColor: "#a89b70",
          sectionColor: "#d4c68f",
        }
      case "mountain":
        return {
          color: "#6d6552",
          gridColor: "#5a5245",
          sectionColor: "#7d7562",
        }
      case "arena":
        return {
          color: "#4a4a4a",
          gridColor: "#3a3a3a",
          sectionColor: "#8a3a3a",
        }
      default:
        return {
          color: "#444444",
          gridColor: "#6f6f6f",
          sectionColor: "#9d4b4b",
        }
    }
  }

  const floorProps = getFloorProps()

  return (
    <>
      {/* Sky */}
      <Sky
        distance={450000}
        sunPosition={
          skyPreset === "sunset"
            ? [1, 0.1, 0]
            : skyPreset === "night"
              ? [0, -1, 0]
              : skyPreset === "dawn"
                ? [-1, 0.1, 0]
                : [0, 1, 0]
        }
        inclination={0.5}
        azimuth={0.25}
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={floorProps.color} />
        <Grid
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.5}
          cellColor={floorProps.gridColor}
          sectionSize={5}
          sectionThickness={1}
          sectionColor={floorProps.sectionColor}
          fadeDistance={50}
          fadeStrength={1}
        />
      </mesh>
    </>
  )
}
