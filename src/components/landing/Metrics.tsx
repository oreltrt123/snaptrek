"use client"

import { type PropsWithChildren, useRef } from "react"
import { useScroll, useTransform, useSpring, motion } from "framer-motion"
import { Swords, Trophy, Users, Target } from "lucide-react"

import { MetricsItem } from "@/components/landing/MetricsItem"
import { AnimatedTitle } from "@/components/motion/AnimatedTitle"

export function Metrics({ children }: PropsWithChildren) {
  const ref = useRef<HTMLUListElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", `end 0.7`],
  })

  const opacity = useSpring(useTransform(scrollYProgress, [0.34, 0.425, 0.98, 1], [0, 1, 1, 0]))

  return (
    <section className="pb-8 pt-16 md:py-20">
      <AnimatedTitle>
        <h2 className="heading-section">
          <span className="text-primary">SnapTrek</span> battle{" "}
          <span className="text-secondary underline decoration-wavy underline-offset-4 md:underline-offset-8">
            stats
          </span>
        </h2>
      </AnimatedTitle>
      <ul ref={ref} className="relative mt-24 grid grid-cols-12 pb-40 sm:grid-cols-9 lg:px-[15%]">
        <li className="sticky top-[20%] col-start-2 col-end-12 pb-8 sm:col-start-3 sm:col-end-8 sm:pb-16 lg:top-[5%] lg:pb-40">

        </li>
        <li className="sticky top-[22.5%] col-start-2 col-end-12 pb-8 sm:col-start-1 sm:col-end-5 sm:pb-16 lg:pb-40">
          <MetricsItem
            className="bg-secondary"
            number={150}
            description="unique weapon skins"
            offset={22.5}
            progress={scrollYProgress}
          >
            <Trophy className="h-full w-full" strokeWidth={1.5} />
          </MetricsItem>
        </li>
        <li className="sticky top-[25%] col-start-2 col-end-12 pb-8 sm:col-start-6 sm:col-end-10 sm:pb-16 lg:pb-40">
          <MetricsItem
            className="bg-highlight"
            number={15}
            prefix="~"
            suffix="M"
            description="players worldwide"
            offset={25}
            progress={scrollYProgress}
          >
            <Users className="h-full w-full" strokeWidth={1.5} />
          </MetricsItem>
        </li>
        <li className="sticky top-[20%] col-start-1 col-end-13 pb-8 sm:col-start-2 sm:col-end-9 sm:pb-16 lg:top-[5%] lg:pb-40">
          <MetricsItem
            className="bg-gradient-to-b from-primary to-primary-depth to-80%"
            number={98}
            suffix="%"
            description="headshot accuracy of top players"
            offset={20}
            progress={scrollYProgress}
            last
          >
            <Target className="h-full w-full" strokeWidth={1.5} />
          </MetricsItem>
        </li>
        <li className="z-1 col-start-1 col-end-13 sm:col-end-10">
          <div className="">{children}</div>
        </li>
      </ul>
      <motion.div className="bg-primary-dark fixed inset-0 -z-1 pointer-events-none" style={{ opacity }} />
    </section>
  )
}
