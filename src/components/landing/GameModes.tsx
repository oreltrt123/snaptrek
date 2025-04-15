import { GameModePill } from "@/components/landing/GameModePill"
import type React from "react"

// Import the PillVariant type from GameModePill
import type { PillVariant } from "@/components/landing/GameModePill"

interface GameMode {
  modeIcon: string
  title: string
  modeName: string
}

interface GameModesProps {
  gameModes: GameMode[]
}

// Define variants with the correct type
const variants: PillVariant[] = ["primary", "secondary"]

const GameModes: React.FC<GameModesProps> = ({ gameModes }) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gameModes.map(({ modeIcon, title, modeName }, index) => (
        <li key={title} className="flex justify-center">
          <GameModePill
            title={title}
            description={modeName}
            icon={modeIcon}
            tilt={index % 2 === 0 ? -1 : 1}
            variant={variants[index % variants.length]}
          />
        </li>
      ))}
    </ul>
  )
}

export default GameModes