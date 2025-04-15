import { type PillVariant, GameModePill } from "@/components/landing/LanguagePill"
import { gameModes } from "@/config/gameModes"

const variants: NonNullable<PillVariant>[] = [
  "secondary",
  "highlightOutline",
  "secondaryOutline",
  "primary",
  "highlight",
  "default",
  "primaryOutline",
]

export function Fluency() {
  return (
    <ul className="flex flex-col gap-8 px-[5%] lg:px-0">
      {gameModes.map(({ modeIcon, title, modeName }, index) => (
        <li key={title} className="flex justify-center">
          <GameModePill
            title={title}
            modeName={modeName}
            modeIcon={modeIcon}
            tilt={index % 2 === 0 ? -1 : 1}
            variant={variants[index % variants.length]}
          />
        </li>
      ))}
    </ul>
  )
}

