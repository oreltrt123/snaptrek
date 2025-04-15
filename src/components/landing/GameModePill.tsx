"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export type PillVariant =
  | "primary"
  | "secondary"
  | "highlight"
  | "default"
  | "primaryOutline"
  | "secondaryOutline"
  | "highlightOutline"
  | null

interface GameModePillProps {
  title: string
  description: string
  icon: string
  tilt?: number
  variant?: PillVariant
}

const variantStyles: Record<NonNullable<PillVariant>, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  highlight: "bg-highlight text-highlight-foreground",
  default: "bg-background text-foreground",
  primaryOutline: "bg-background text-primary border-2 border-primary",
  secondaryOutline: "bg-background text-secondary border-2 border-secondary",
  highlightOutline: "bg-background text-highlight border-2 border-highlight",
}

export function GameModePill({ title, description, icon, tilt = 0, variant = "default" }: GameModePillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        "flex w-full max-w-md items-center gap-4 rounded-full px-6 py-4 shadow-lg",
        variant && variantStyles[variant],
        tilt === -1 && "rotate-[-1deg]",
        tilt === 1 && "rotate-[1deg]",
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/20 text-2xl">{icon}</div>
      <div className="flex flex-col">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </motion.div>
  )
}

