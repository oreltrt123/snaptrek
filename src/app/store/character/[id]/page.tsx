import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { CharacterDetailClient } from "@/components/store/character-detail-client"

// Define the Character type
interface Character {
  id: string
  name: string
  description: string
  price: number
  rarity: string
  imageUrl: string
  modelPath: string
  stats?: {
    strength: number
    agility: number
    defense: number
    magic: number
  }
}

// Define the type for the characters object
type CharactersRecord = Record<string, Character>

// Define characters outside component to avoid dependency issues
const characters: CharactersRecord = {
  char1: {
    id: "char1",
    name: "Shadow Warrior",
    description:
      "A stealthy fighter with exceptional agility and precision. Trained in the ancient arts of shadow combat, this warrior can strike silently and disappear without a trace. Perfect for players who prefer a strategic approach to combat.",
    price: 1200,
    rarity: "rare",
    imageUrl: "/cybernetic-guardian.png",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    stats: {
      strength: 70,
      agility: 90,
      defense: 60,
      magic: 40,
    },
  },
  char2: {
    id: "char2",
    name: "Cyber Knight",
    description:
      "Armored protector with advanced tech and powerful shields. The Cyber Knight combines ancient chivalry with futuristic technology, creating an unstoppable force on the battlefield. Their energy shields can withstand massive damage while they close in for devastating melee attacks.",
    price: 1500,
    rarity: "epic",
    imageUrl: "/armored-enforcer.png",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    stats: {
      strength: 80,
      agility: 60,
      defense: 90,
      magic: 30,
    },
  },
  char3: {
    id: "char3",
    name: "Mystic Mage",
    description:
      "Wields ancient magic with devastating elemental attacks. The Mystic Mage has studied the arcane arts for centuries, mastering spells that can manipulate the very fabric of reality. Their elemental attacks can adapt to any situation, making them versatile and unpredictable.",
    price: 1000,
    rarity: "rare",
    imageUrl: "/arcane-scholar.png",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    stats: {
      strength: 40,
      agility: 70,
      defense: 50,
      magic: 95,
    },
  },
  char4: {
    id: "char4",
    name: "Neon Assassin",
    description:
      "Lightning-fast striker that leaves a trail of neon light. The Neon Assassin moves faster than the eye can track, leaving behind dazzling trails of light that confuse and disorient enemies. Their speed makes them nearly impossible to hit, while their precision strikes can take down opponents before they even realize what's happening.",
    price: 2000,
    rarity: "legendary",
    imageUrl: "/cyber-shadow.png",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    stats: {
      strength: 75,
      agility: 95,
      defense: 45,
      magic: 60,
    },
  },
  char5: {
    id: "char5",
    name: "Void Walker",
    description:
      "A mysterious entity that can phase through dimensions and manipulate dark energy. The Void Walker exists between realities, allowing it to bypass conventional defenses and strike from impossible angles. Its mastery of void energy creates devastating area effects that can swallow enemies whole.",
    price: 2500,
    rarity: "legendary",
    imageUrl: "/void-walker.png",
    modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
    stats: {
      strength: 85,
      agility: 75,
      defense: 70,
      magic: 95,
    },
  },
  char6: {
    id: "char6",
    name: "Cosmic Wanderer",
    description:
      "A traveler from beyond the stars with mysterious cosmic powers. The Cosmic Wanderer harnesses the energy of distant galaxies, wielding powers that few in this realm can comprehend. Their celestial abilities allow them to manipulate gravity, create stellar explosions, and even bend the fabric of space-time itself.",
    price: 3000,
    rarity: "legendary",
    imageUrl: "/celestial-wanderer.png",
    modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
    stats: {
      strength: 85,
      agility: 80,
      defense: 75,
      magic: 100,
    },
  },
  char7: {
    id: "char7",
    name: "Astral Nomad",
    description:
      "A dimensional traveler who harnesses the power of celestial bodies and astral energy. The Astral Nomad exists in multiple planes simultaneously, allowing them to predict enemy movements and counter with perfect timing. Their connection to the cosmos grants them unparalleled insight and the ability to manipulate the very fabric of reality.",
    price: 3500,
    rarity: "legendary",
    imageUrl: "/astral-nomad.png",
    modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
    stats: {
      strength: 90,
      agility: 85,
      defense: 80,
      magic: 95,
    },
  },
}

export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Await the params Promise to get the actual values
  const { id } = await params

  // Create a Supabase client for server-side auth check
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Redirect to login if not authenticated
    redirect("/login")
  }

  // Get character data with type assertion
  const character = characters[id as keyof typeof characters]

  if (!character) {
    // Redirect to store if character not found
    redirect("/store")
  }

  return <CharacterDetailClient character={character} userId={session.user.id} />
}