import { BrandMark } from "@/components/shared/brand-mark"

/* Hallmark · design-system: design.md · designed-as-app
 * Echo teaser — split layout with ceremony mark visual.
 */

export function EchoBlock() {
  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <BrandMark size="sm" />
            <p className="font-display italic text-sm text-muted-foreground">
              Echo · forthcoming
            </p>
          </div>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
            AI as a calm guide.
            <br />
            <span className="text-muted-foreground/80">
              Never a performance.
            </span>
          </h2>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            Echo reads your reflections, not your screen. It asks the question
            you{"\u2019"}ve been avoiding, surfaces patterns across seasons,
            and helps you close the week without judgment. On Free, Echo
            remembers the current quarter. On Pro, it remembers the whole
            year — and the year before.
          </p>
        </div>

        <div
          aria-hidden
          className="relative flex aspect-square max-w-md mx-auto lg:max-w-none items-center justify-center rounded-3xl border border-border/70 p-12"
        >
          <div className="absolute inset-[22%] rounded-full border border-border/60" />
          <div className="absolute inset-[32%] rounded-full border border-border/40" />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <BrandMark size="xl" />
            <p className="font-display italic text-lg text-muted-foreground max-w-[16ch]">
              Patterns across seasons, not across your screen
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
