import NextLink from 'next/link'
import "@/app/globals.css"

export function Header() {
  return (
    <header className="relative flex justify-center">
      <div className="z-1 flex w-full items-center justify-between gap-2 px-2 sm:px-8">
        <div className="flex flex-1 items-center justify-start gap-1 max-sm:hidden">
          {/* Theme toggle removed */}
        </div>
        <NextLink
          href="/"
          className="focus-visible group flex h-16 flex-col items-center gap-1 rounded-b-3xl 
          bg-secondary/30 px-[6px] pt-2 text-2xl transition-colors
           hover:bg-primary/25 dark:bg-card dark:hover:bg-border/70 sm:size-32 
           sm:rounded-b-4xl sm:pt-4 sm:text-3xl lg:w-36 lg:text-4xl"
          title="WarpZone app"
        >
          <span className="font-display -tracking-widest max-sm:sr-only">SnapTrek</span>
        </NextLink>
      </div>
    </header>
  )
}
