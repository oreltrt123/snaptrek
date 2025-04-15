"use client"

import type { Variants } from "framer-motion"
import { Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedTitle } from "@/components/motion/AnimatedTitle"
import { AnimatedList, AnimatedListItem } from "@/components/motion/AnimatedList"
import { AnimatedHeroDecor } from "@/components/motion/AnimatedHeroDecor"
import Link from "next/link"
import { Crosshair, Shield, Trophy, Users } from "lucide-react"
import "../../styles/navbar.css"

const list = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
      delayChildren: 0.5,
    },
  },
  hidden: { opacity: 0 },
} satisfies Variants

const item = {
  visible: { opacity: 1, y: "0%", scale: 1, transition: { duration: 0.45 } },
  hidden: { opacity: 0, y: "100%", scale: 0.85 },
} satisfies Variants

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-32 lg:pt-24">
      <div className="container1"></div>
      <AnimatedTitle>
        <h1 className="flex w-full flex-col items-center justify-center gap-2 text-balance py-6 text-center font-display text-3xl font-bold capitalize leading-normal tracking-tighter sm:text-4xl sm:leading-snug md:gap-4 md:text-6xl">
          <span>
            Drop in, battle, survive—made to{" "}
            <span className="text13345 rounded-full  px-[0.35em] py-[0.125em]">
              dominate
            </span>
          </span>
          <span className="flex flex-wrap items-center justify-center">
            the arena{" "}
            <span className="group relative ml-[0.25em] flex h-[1.35em] w-[1.5em] items-center justify-center rounded-full bg-secondary/30 dark:text-secondary">
              <Gamepad2 className="z-1 h-[1.25em] w-[1.25em] group-hover:animate-pulse" strokeWidth={2.15} />
            </span>
            <span className="mr-[0.25em]">
              <span className="sr-only">in</span>
              <span className="lowercase" aria-hidden="true">
                n 
              </span>
            </span>{" "}
            SnapTrek.
          </span>
        </h1>
      </AnimatedTitle>
      <div className="mx-auto my-12 min-h-40 max-w-80">
        <AnimatedList variants={list} className="flex flex-col gap-3">
          <AnimatedListItem variants={item}>
            <Link href={"/sign-up"}>
              <button className="w-full">
                <span className="truncate">Battle Pass Access</span>
              </button>
            </Link>
          </AnimatedListItem>
          <AnimatedListItem variants={item}>
            <Link href={"/login"}>
              <Button size="lg" className="w-full text-secondary text1334">
                <span className="text-primary hover:underline text1334">I already have a squad</span>
              </Button>
            </Link>
          </AnimatedListItem>
        </AnimatedList>
      </div>
      <div className="absolute -left-[2%] top-[13%] -z-1 sm:left-[10%]">
        <AnimatedHeroDecor className="origin-bottom-right" delay={0.8}>
          <div className="size-20 -rotate-12 rounded-lg bg-gradient-to-br from-highlight/70  to-transparent p-2 text-background sm:size-24 lg:size-32">
            <Crosshair className="h-full w-full" />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="absolute right-[10%] top-[13%] -z-1 max-md:hidden">
        <AnimatedHeroDecor className="origin-bottom-left" move={60} delay={1}>
          <div className="size-24 rotate-12 rounded-lg bg-gradient-to-bl from-highlight/70  to-transparent p-2 text-background lg:size-32">
            <Trophy className="h-full w-full" />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="absolute bottom-[10%] left-[10%] -z-1 max-md:hidden">
        <AnimatedHeroDecor className="origin-top-right" move={60} delay={1.2}>
          <div className="size-24 -rotate-6 rounded-lg bg-gradient-to-r from-secondary/30  to-transparent p-2 text-background lg:size-32">
            <Shield className="h-full w-full" />
          </div>
        </AnimatedHeroDecor>
      </div>
      <div className="absolute -right-[2%] top-1/3 -z-1 sm:right-[10%] md:top-2/3">
        <AnimatedHeroDecor className="origin-top-left" delay={1.4}>
          <div className="size-20 rotate-12 rounded-lg bg-gradient-to-l from-secondary/30  to-transparent p-2 text-background sm:size-24 lg:size-32">
            <Users className="h-full w-full" />
          </div>
        </AnimatedHeroDecor>
      </div>
    </section>
  )
}
