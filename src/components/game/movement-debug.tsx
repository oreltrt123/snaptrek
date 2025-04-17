"use client"

interface MovementDebugProps {
  position?: { x: number; y: number; z: number }
}

export function MovementDebug({ position }: MovementDebugProps) {
  // Default position if none is provided
  const pos = position || { x: 0, y: 0, z: 0 }

  return (
    <div className="text-xs font-mono">
      <h3 className="font-bold mb-2">Position</h3>
      <div>X: {pos.x.toFixed(2)}</div>
      <div>Y: {pos.y.toFixed(2)}</div>
      <div>Z: {pos.z.toFixed(2)}</div>
      <div className="mt-2 text-gray-400">Use WASD to move</div>
    </div>
  )
}
