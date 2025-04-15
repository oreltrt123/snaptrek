import { Globe, Share2, Heart, Zap } from "lucide-react"
import { AnimatedTitle } from "@/components/motion/AnimatedTitle"
import { ReasonsItem } from "@/components/landing/ReasonsItem"

export function Reasons() {
  return (
    <section className="space-y-28 px-1 pb-1">
      <AnimatedTitle>
        <h2 className="heading-section">
          Why should you <span className="text-highlight-depth">join SnapTrek and</span> what are our{" "}
          <span className="relative inline-block before:absolute before:-bottom-0 before:-right-[0.6em] before:-z-1 before:size-[1.375em] before:rounded-full before:bg-primary-light/60">
            features?
          </span>
        </h2>
      </AnimatedTitle>
      <ul className="space-y-1 text-2xl sm:text-3xl md:text-4xl">
        <li>
          <ReasonsItem
            className="text-primary-dark bg-primary/80 hover:bg-primary/65 dark:hover:bg-primary"
            reason="Smart feed learns your preferences to show content you'll love."
          >
            <Zap />
          </ReasonsItem>
        </li>
        <li>
          <ReasonsItem
            className="bg-secondary/60 text-secondary-depth hover:bg-secondary/40 dark:bg-secondary/85 dark:hover:bg-secondary"
            reason="Share your adventures from anywhere with full cross-device sync."
            delay={0.2}
          >
            <Globe />
          </ReasonsItem>
        </li>
        <li>
          <ReasonsItem
            reason="Connect with like-minded travelers and explorers worldwide."
            className="bg-highlight/60 text-highlight-depth hover:bg-highlight/40 dark:bg-highlight/85 dark:hover:bg-highlight"
            delay={0.3}
          >
            <Share2 />
          </ReasonsItem>
        </li>
        <li>
          <ReasonsItem
            reason="Earn rewards and recognition for your most inspiring content."
            className="bg-primary-light/60 text-primary-depth hover:bg-primary-light/40 dark:hover:bg-primary-light"
            delay={0.4}
          >
            <Heart />
          </ReasonsItem>
        </li>
      </ul>
    </section>
  )
}

