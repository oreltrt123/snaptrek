import { Asterisk, ArrowDown } from 'lucide-react'
import { MotionDiv } from '@/components/motion'
import { AnimatedTitle } from '@/components/motion/AnimatedTitle'

export function Footer() {
  return (
    <footer className="space-y-4 px-1 pb-4">
      <MotionDiv
        initial={{ y: '10%', scale: 0.95, opacity: 0 }}
        whileInView={{ y: '0%', scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="relative mx-auto flex h-80 flex-col justify-between overflow-hidden rounded-4xl bg-primary-depth/90 text-background dark:bg-card sm:h-96 lg:h-[26rem]"
      >
        <div className="flex border-b-2 border-border/70 dark:border-card dark:bg-primary max-md:flex-col-reverse text-black">
          <div className="group flex w-full flex-1 gap-12 overflow-hidden whitespace-nowrap border-border/70 py-2 text-lg capitalize max-md:border-t-2 sm:text-2xl md:border-r-2 md:py-4">
            <p className="flex animate-footer-marquee items-center gap-12 group-hover:paused">
              <span>Drop in and claim your Victory Royale!</span>
              <ArrowDown className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
              <span>Build, battle, and survive to the end.</span>
              <Asterisk className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
            </p>
            <p
              className="flex animate-footer-marquee items-center gap-12 group-hover:paused"
              aria-hidden="true"
            >
              <span>Drop in and claim your Victory Royale!</span>
              <ArrowDown className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
              <span>Build, battle, and survive to the end.</span>
              <Asterisk className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
            </p>
            <p
              className="flex animate-footer-marquee items-center gap-12 group-hover:paused"
              aria-hidden="true"
            >
              <span>Drop in and claim your Victory Royale!</span>
              <ArrowDown className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
              <span>Build, battle, and survive to the end.</span>
              <Asterisk className="h-[1.5em] w-[1.5em]" aria-hidden="true" strokeWidth={2.25} />
            </p>
          </div>
        </div>
        <div className="flex-grow select-none overflow-hidden">
          <AnimatedTitle className="md:absolute md:-bottom-1/4 md:left-0 md:translate-x-0">
            <p className="pr-6 font-display text-[min(37vw,300px)] -tracking-widest dark:text-card-foreground">
              Lingo
            </p>
          </AnimatedTitle>
          <MotionDiv
            className="relative ml-auto flex h-full w-1/3 flex-col justify-end max-md:hidden"
            initial={{ y: '95%', x: '2%' }}
            whileInView={{ y: '15%' }}
            transition={{ type: 'spring', duration: 1.2 }}
            viewport={{ margin: '10% 0% 0% 0%' }}
          >
            <div className="drop-shadow-2xl saturate-[0.7] dark:hue-rotate-[50deg]">
 
            </div>
          </MotionDiv>
        </div>
      </MotionDiv>
      <p className="text-center max-sm:text-sm">
        © 2025 — WarpZone by{' '}
        <a
          href="https://github.com/elitenoire"
          target="_blank"
          className="font-semibold decoration-dotted transition hover:underline"
        >
          @OrelRevivo
        </a>{' '}
        .
      </p>
    </footer>
  )
}
