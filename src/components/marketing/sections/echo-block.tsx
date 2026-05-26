import { Sparkles } from "lucide-react"

/**
 * Marketing teaser only — describes an upcoming reflective-AI surface.
 * This section does NOT mount a working AI panel; it sets expectation for a
 * future product surface and is safe to ship as-is.
 */
export function EchoBlock() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 md:p-12 grid md:grid-cols-[auto_1fr] gap-8 items-start">
        <div className="h-12 w-12 rounded-2xl bg-amber/10 text-amber flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-3">
            Echo — your reflective companion · coming soon
          </div>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] mb-4">
            AI as a calm guide. Never a performance.
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Echo reads your reflections, not your screen. It asks the question
            you&apos;ve been avoiding, surfaces patterns across seasons, and helps you
            close the week without judgment. On Free, Echo remembers the current
            quarter. On Pro, it remembers the whole year — and the year before.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              <span className="h-1 w-1 rounded-full bg-amber" /> Pattern detection
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              <span className="h-1 w-1 rounded-full bg-amber" /> Quarter &amp; year memory
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
              <span className="h-1 w-1 rounded-full bg-amber" /> Never gimmicky
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
