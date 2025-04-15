// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { supabase } from "@/lib/supabase"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Coins, ShoppingBag, User, Axe } from "lucide-react"
// import type { User as SupabaseUser } from "@supabase/supabase-js"
// import { CharacterCard } from "@/components/store/character-card"
// import { CoinPurchaseModal } from "@/components/store/coin-purchase-modal"
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// interface Character {
//   id: string
//   name: string
//   description: string
//   price: number
//   rarity: string
//   imageUrl: string
//   modelPath: string
// }

// export default function StorePage() {
//   const [user, setUser] = useState<SupabaseUser | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [coins, setCoins] = useState(0)
//   const [showCoinModal, setShowCoinModal] = useState(false)
//   const [notification, setNotification] = useState<{
//     type: "success" | "error"
//     title: string
//     message: string
//   } | null>(null)
//   const [ownedCharacters, setOwnedCharacters] = useState<string[]>([])
//   const router = useRouter()

//   // Sample characters data - in a real app, this would come from the database
//   // IMPORTANT: These IDs must match the CHARACTER_MODELS in character-model.tsx
//   const characters: Character[] = [
//     {
//       id: "char1",
//       name: "Shadow Warrior",
//       description: "A stealthy fighter with exceptional agility and precision.",
//       price: 1200,
//       rarity: "rare",
//       imageUrl: "/cybernetic-guardian.png",
//       modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
//     },
//     {
//       id: "char2",
//       name: "Cyber Knight",
//       description: "Armored protector with advanced tech and powerful shields.",
//       price: 1500,
//       rarity: "epic",
//       imageUrl: "/armored-enforcer.png",
//       modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
//     },
//     {
//       id: "char3",
//       name: "Mystic Mage",
//       description: "Wields ancient magic with devastating elemental attacks.",
//       price: 1000,
//       rarity: "rare",
//       imageUrl: "/arcane-scholar.png",
//       modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
//     },
//     {
//       id: "char4",
//       name: "Neon Assassin",
//       description: "Lightning-fast striker that leaves a trail of neon light.",
//       price: 2000,
//       rarity: "legendary",
//       imageUrl: "/cyber-shadow.png",
//       modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
//     },
//     {
//       id: "char5",
//       name: "Void Walker",
//       description: "A mysterious entity that can phase through dimensions and manipulate dark energy.",
//       price: 2500,
//       rarity: "legendary",
//       imageUrl: "/void-walker.png",
//       modelPath: "/assets/3d/67fceb28cde84e5e1b093c66.glb",
//     },
//     {
//       id: "char6",
//       name: "Cosmic Wanderer",
//       description: "A traveler from beyond the stars with mysterious cosmic powers.",
//       price: 3000,
//       rarity: "legendary",
//       imageUrl: "/celestial-wanderer.png",
//       modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a.glb",
//     },
//     {
//       id: "char7",
//       name: "Astral Nomad",
//       description: "A dimensional traveler who harnesses the power of celestial bodies and astral energy.",
//       price: 3500,
//       rarity: "legendary",
//       imageUrl: "/astral-nomad.png",
//       modelPath: "/assets/3d/67fd09ffe6ca40145d1c2b8a2.glb",
//     },
//     // Add more characters here as you create them
//   ]

//   useEffect(() => {
//     const checkSession = async () => {
//       try {
//         const { data, error } = await supabase.auth.getSession()

//         if (error) {
//           console.log("Session check error:", error.message)
//           router.push("/login")
//           return
//         }

//         if (!data.session) {
//           router.push("/login")
//           return
//         }

//         setUser(data.session.user)

//         // Load owned characters from localStorage
//         const storedOwnedCharacters = localStorage.getItem("ownedCharacters")
//         if (storedOwnedCharacters) {
//           try {
//             setOwnedCharacters(JSON.parse(storedOwnedCharacters))
//           } catch (parseError) {
//             console.error("Error parsing owned characters:", parseError)
//             setOwnedCharacters([])
//           }
//         }

//         // First check localStorage for coins (for immediate UI update)
//         const localCoins = localStorage.getItem("userCoins")
//         if (localCoins) {
//           try {
//             setCoins(Number.parseInt(localCoins, 10))
//           } catch (parseError) {
//             console.error("Error parsing coins:", parseError)
//             setCoins(0)
//           }
//         }

//         // Then fetch from database for accuracy
//         try {
//           const { data: profileData, error: profileError } = await supabase
//             .from("profiles")
//             .select("coins")
//             .eq("id", data.session.user.id)
//             .single()

//           if (profileError) {
//             console.log("Error fetching profile:", profileError.message)
//           } else if (profileData) {
//             setCoins(profileData.coins || 0)
//             // Update localStorage with the latest value from the database
//             localStorage.setItem("userCoins", (profileData.coins || 0).toString())
//           }
//         } catch (dbError) {
//           console.error("Database error:", dbError)
//         }

//         setLoading(false)
//       } catch (err) {
//         console.log("Error checking session:", err)
//         router.push("/login")
//       }
//     }

//     checkSession()
//   }, [router])

//   const handleBuyCoins = () => {
//     setShowCoinModal(true)
//   }

//   const handleCoinPurchaseComplete = (newCoins: number) => {
//     // Update the UI immediately
//     setCoins(coins + newCoins)

//     // Update localStorage for persistence
//     localStorage.setItem("userCoins", (coins + newCoins).toString())

//     setShowCoinModal(false)

//     // Show success notification
//     setNotification({
//       type: "success",
//       title: "Purchase Complete",
//       message: `${newCoins} coins have been added to your account!`,
//     })

//     // Clear notification after 3 seconds
//     setTimeout(() => setNotification(null), 3000)
//   }

//   const handleCharacterPurchase = (characterId: string, price: number) => {
//     // Check if character is already owned
//     if (ownedCharacters.includes(characterId)) {
//       return
//     }

//     // Update coins
//     const newCoinsAmount = coins - price
//     setCoins(newCoinsAmount)
//     localStorage.setItem("userCoins", newCoinsAmount.toString())

//     // Update owned characters
//     const newOwnedCharacters = [...ownedCharacters, characterId]
//     setOwnedCharacters(newOwnedCharacters)

//     // Log the updated owned characters
//     console.log("Updated owned characters:", newOwnedCharacters)

//     // Save to localStorage
//     localStorage.setItem("ownedCharacters", JSON.stringify(newOwnedCharacters))

//     // Show success notification
//     setNotification({
//       type: "success",
//       title: "Purchase Complete",
//       message: `Character has been added to your collection!`,
//     })

//     // Clear notification after 3 seconds
//     setTimeout(() => setNotification(null), 3000)
//   }

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-900">
//         <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       {notification && (
//         <div className="fixed top-4 right-4 z-50 w-80">
//           <Alert
//             className={
//               notification.type === "error" ? "bg-red-900/50 border-red-500" : "bg-green-900/50 border-green-500"
//             }
//           >
//             <AlertTitle>{notification.title}</AlertTitle>
//             <AlertDescription>{notification.message}</AlertDescription>
//           </Alert>
//         </div>
//       )}

//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold">Store</h1>
//           <div className="flex items-center gap-4">
//             <Button
//               variant="outline"
//               className="border-2 border-yellow-500 text-white hover:bg-yellow-500/20 flex items-center gap-2"
//               onClick={handleBuyCoins}
//             >
//               <Coins className="h-5 w-5 text-yellow-400" />
//               <span className="font-bold">{coins}</span>
//               <span className="text-xs">+</span>
//             </Button>
//             <Button
//               variant="outline"
//               className="border-2 border-purple-500 text-white hover:bg-purple-500/20"
//               onClick={() => router.push("/locker")}
//             >
//               <User className="mr-2 h-5 w-5" />
//               Locker
//             </Button>
//           </div>
//         </div>

//         <Tabs defaultValue="characters" className="w-full">
//           <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-800">
//             <TabsTrigger value="characters" className="data-[state=active]:bg-purple-700">
//               <User className="mr-2 h-5 w-5" />
//               Characters
//             </TabsTrigger>
//             <TabsTrigger value="gear" className="data-[state=active]:bg-purple-700">
//               <Axe className="mr-2 h-5 w-5" />
//               Gear (Coming Soon)
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="characters" className="mt-0">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {characters.map((character) => (
//                 <CharacterCard
//                   key={character.id}
//                   character={character}
//                   userCoins={coins}
//                   onViewDetails={() => router.push(`/store/character/${character.id}`)}
//                   onPurchaseComplete={handleCharacterPurchase}
//                   ownedCharacters={ownedCharacters}
//                 />
//               ))}
//             </div>
//           </TabsContent>

//           <TabsContent value="gear" className="mt-0">
//             <div className="flex flex-col items-center justify-center py-20">
//               <ShoppingBag className="h-16 w-16 text-gray-600 mb-4" />
//               <h3 className="text-2xl font-bold text-gray-400">Coming Soon</h3>
//               <p className="text-gray-500">Gear and accessories will be available in future updates.</p>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Coin Purchase Modal */}
//       {showCoinModal && (
//         <CoinPurchaseModal
//           onClose={() => setShowCoinModal(false)}
//           onPurchaseComplete={handleCoinPurchaseComplete}
//           userId={user?.id || ""}
//         />
//       )}
//     </div>
//   )
// }
export default function Page() {
  return(
    <div>
      
    </div>
  )
}