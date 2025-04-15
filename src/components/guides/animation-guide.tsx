"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AnimationGuide() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Adding Animations to ReadyPlayer.me Characters</h1>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-700">
              Overview
            </TabsTrigger>
            <TabsTrigger value="mixamo" className="data-[state=active]:bg-purple-700">
              Mixamo Guide
            </TabsTrigger>
            <TabsTrigger value="implementation" className="data-[state=active]:bg-purple-700">
              Implementation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>How Character Animation Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  ReadyPlayer.me provides 3D character models in GLB format, but these models don't come with animations
                  by default. To make your characters move, you need to add animations separately.
                </p>

                <h3 className="text-xl font-semibold mt-4">Animation Options:</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-300">
                  <li>
                    <strong className="text-purple-400">Mixamo Animations:</strong> Free, high-quality animations from
                    Adobe that can be applied to any humanoid model
                  </li>
                  <li>
                    <strong className="text-purple-400">Custom Animations:</strong> Create your own animations using
                    tools like Blender
                  </li>
                  <li>
                    <strong className="text-purple-400">Procedural Animations:</strong> Generate animations through code
                    (what we're using as a fallback)
                  </li>
                </ol>

                <div className="bg-purple-900/30 border border-purple-500 p-4 rounded-md mt-6">
                  <p className="font-semibold">Our Solution:</p>
                  <p className="text-sm">
                    We've implemented a hybrid approach that uses procedural animations as a fallback, but you can
                    enhance your game by adding Mixamo animations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mixamo" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Using Mixamo for Character Animations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold">Step 1: Export Your ReadyPlayer.me Character</h3>
                <p className="text-gray-300">First, download your character from ReadyPlayer.me in GLB format.</p>

                <h3 className="text-xl font-semibold mt-6">Step 2: Visit Mixamo</h3>
                <p className="text-gray-300">
                  Go to{" "}
                  <a
                    href="https://www.mixamo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline"
                  >
                    https://www.mixamo.com
                  </a>{" "}
                  and sign in with your Adobe ID (free to create).
                </p>

                <h3 className="text-xl font-semibold mt-6">Step 3: Upload Your Character</h3>
                <ol className="list-decimal pl-6 space-y-2 text-gray-300">
                  <li>Click "Upload Character" in the top-right corner</li>
                  <li>Upload your ReadyPlayer.me GLB file</li>
                  <li>Mixamo will automatically rig your character</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6">Step 4: Choose Animations</h3>
                <p className="text-gray-300">
                  Browse and select animations for your character. For a basic character controller, you'll need:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-2">
                  <li>Idle animation</li>
                  <li>Walking animation</li>
                  <li>Running animation</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6">Step 5: Download Animations</h3>
                <p className="text-gray-300">For each animation:</p>
                <ol className="list-decimal pl-6 space-y-2 text-gray-300 mt-2">
                  <li>Click "Download"</li>
                  <li>Format: FBX for Unity or glTF/GLB for direct web use</li>
                  <li>Skin: With Skin</li>
                  <li>Frames per Second: 30</li>
                  <li>Click "Download" again</li>
                </ol>

                <h3 className="text-xl font-semibold mt-6">Step 6: Add to Your Project</h3>
                <p className="text-gray-300">Place the downloaded animation files in your project's public folder:</p>
                <div className="bg-gray-900 p-3 rounded font-mono text-sm mt-2">
                  /public/assets/animations/idle.glb
                  <br />
                  /public/assets/animations/walking.glb
                  <br />
                  /public/assets/animations/running.glb
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Implementing Animations in Your Game</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Once you have your animations, you need to load and play them in your game. We've already set up the
                  basic structure in the <code className="bg-gray-900 px-1 py-0.5 rounded">AnimatedReadyPlayer</code>{" "}
                  component.
                </p>

                <h3 className="text-xl font-semibold mt-6">Loading External Animations</h3>
                <p className="text-gray-300">
                  To load external animations, you'll need to modify the component to load animation files separately:
                </p>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm mt-2 overflow-auto">
                  {`// Inside AnimatedReadyPlayer component
const { scene: characterScene } = useGLTF(modelPath)
const { scene: idleScene } = useGLTF('/assets/animations/idle.glb')
const { scene: walkingScene } = useGLTF('/assets/animations/walking.glb')
const { scene: runningScene } = useGLTF('/assets/animations/running.glb')

// Extract animations
const idleAnimation = idleScene.animations[0]
const walkingAnimation = walkingScene.animations[0]
const runningAnimation = runningScene.animations[0]

// Combine animations
const combinedAnimations = [idleAnimation, walkingAnimation, runningAnimation]

// Create animation mixer
const mixer = new THREE.AnimationMixer(characterScene)

// Create animation actions
const idleAction = mixer.clipAction(idleAnimation)
const walkingAction = mixer.clipAction(walkingAnimation)
const runningAction = mixer.clipAction(runningAnimation)

// Play appropriate animation based on state
if (moving) {
  if (running) {
    runningAction.play()
  } else {
    walkingAction.play()
  }
} else {
  idleAction.play()
}`}
                </div>

                <div className="bg-purple-900/30 border border-purple-500 p-4 rounded-md mt-6">
                  <p className="font-semibold">Important Note:</p>
                  <p className="text-sm">
                    Animation implementation can be complex and may require adjustments based on your specific models
                    and animations. The code above is a simplified example.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6">Advanced Animation Blending</h3>
                <p className="text-gray-300">
                  For smoother transitions between animations, you can use animation blending:
                </p>

                <div className="bg-gray-900 p-3 rounded font-mono text-sm mt-2 overflow-auto">
                  {`// Crossfade from one animation to another
function crossFadeAnimation(startAction, endAction, duration = 0.5) {
  // Set weight to ensure smooth transition
  endAction.enabled = true
  endAction.setEffectiveTimeScale(1)
  endAction.setEffectiveWeight(1)
  
  // Crossfade
  startAction.crossFadeTo(endAction, duration, true)
  
  // Play the end animation
  endAction.play()
}`}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-between">
          <Link href="/lobby">
            <Button variant="outline" className="border-purple-500 text-white hover:bg-purple-500/20">
              Back to Lobby
            </Button>
          </Link>
          <Link href="/animation-test">
            <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
              Test Animation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
