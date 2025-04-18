import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return information about the available characters and models
    return NextResponse.json({
      characters: {
        default: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char1: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char2: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char3: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char4: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char5: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
        char6: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
        char7: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
        char8: "/assets/3d/BodyBlock.fbx",
      },
      animations: {
        idle: "/assets/animations/mixamo/idle.fbx",
        walking: "/assets/animations/mixamo/walking.fbx",
      },
      status: "ok",
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 },
    )
  }
}
