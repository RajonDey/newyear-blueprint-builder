import type { Metadata } from "next"
import Link from "next/link"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { CtaBand } from "@/components/marketing/sections/cta-band"

/* Hallmark · design-system: design.md · designed-as-app
 * About — Letter manifesto, left-aligned long document (Wave E).
 */

export const metadata: Metadata = {
  title: "About",
  description:
    "A calm yearly practice for thoughtful people. Why YearInReview exists, and what it stands against.",
}

export default function AboutPage() {
  return (
    <>
      <section className="container pt-14 md:pt-20 pb-8 md:pb-12">
        <div className="max-w-2xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            Why we built this,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            Reflection over hustle. Clarity over noise.
          </h1>
        </div>
      </section>

      <OrnamentDivider variant="asterisk" className="container max-w-2xl" />

      <article className="container py-12 md:py-16 max-w-2xl text-foreground/90 space-y-6 text-base md:text-lg leading-relaxed">
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
          If that sounds like the year you want —{" "}
          <Link
            href="/signup"
            className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
          >
            welcome
          </Link>
          .
        </p>
      </article>

      <CtaBand />
    </>
  )
}
