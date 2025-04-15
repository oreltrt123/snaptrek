import { Shield, Zap, Users, Trophy, Palette, Sparkles } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-purple-500" />,
      title: "Unique Characters",
      description:
        "Choose from dozens of meticulously designed characters, each with unique abilities and fighting styles.",
    },
    {
      icon: <Zap className="h-10 w-10 text-cyan-500" />,
      title: "Fast-Paced Combat",
      description: "Experience thrilling real-time battles with fluid animations and responsive controls.",
    },
    {
      icon: <Users className="h-10 w-10 text-purple-500" />,
      title: "Multiplayer Arenas",
      description: "Challenge friends or compete against players worldwide in various game modes.",
    },
    {
      icon: <Trophy className="h-10 w-10 text-cyan-500" />,
      title: "Competitive Leagues",
      description: "Climb the ranks, earn rewards, and become the ultimate Realm Rival champion.",
    },
    {
      icon: <Palette className="h-10 w-10 text-purple-500" />,
      title: "Character Customization",
      description: "Personalize your fighters with skins, accessories, and unique emotes.",
    },
    {
      icon: <Sparkles className="h-10 w-10 text-cyan-500" />,
      title: "Special Abilities",
      description: "Master powerful special moves and ultimate abilities to dominate your opponents.",
    },
  ]

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">Game Features</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Dive into an immersive 3D battle experience with stunning visuals and exciting gameplay
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-8 rounded-xl hover:bg-gray-700 transition-colors duration-300">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
