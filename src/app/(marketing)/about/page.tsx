import type { Metadata } from "next"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { CtaBand } from "@/components/marketing/sections/cta-band"

export const metadata: Metadata = {
  title: "About",
  description:
    "A calm yearly practice for thoughtful people. Why YearInReview exists, and what it stands against.",
}

export default function AboutPage() {
  return (
    <>
      <section className="container py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
            Manifesto
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
            Reflection over hustle. Clarity over noise.
          </h1>
        </div>

        <OrnamentDivider variant="asterisk" className="max-w-2xl mx-auto" />

        <article className="max-w-2xl mx-auto text-foreground/90 space-y-6 text-base md:text-lg leading-relaxed">
          <p>
            Most planning tools are built for output. They count tasks, reward
            streaks, and confuse motion with meaning. We&apos;ve used them. They
            don&apos;t make the year better — they just make you tired.
          </p>
          <p>
            YearInReview was built for a different kind of person: someone who
            wants a thoughtful relationship with their year. Someone who knows
            that depth comes from small, consistent practice — not from another
            dashboard.
          </p>
          <p>
            One loop. Reflect, plan, live, review. A weekly five-minute
            check-in. A daily Today surface. A year-end Wrapped that&apos;s
            actually worth keeping. Nothing more, nothing louder.
          </p>
          <p>
            We&apos;re against streak shame, dark patterns, fake urgency, and
            the entire genre of productivity guilt. We&apos;re for white space,
            honest prompts, and tools that disappear when you don&apos;t need
            them.
          </p>
          <p className="text-muted-foreground">
            If that sounds like the year you want — welcome.
          </p>
        </article>
      </section>

      <CtaBand />
    </>
  )
}
