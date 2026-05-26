import type { Metadata } from "next"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { CtaBand } from "@/components/marketing/sections/cta-band"

/* Hallmark · design-system: design.md · designed-as-app
 * How it works — Letter lede + F4 numbered step sequence (Wave E).
 */

export const metadata: Metadata = {
  title: "How it works",
  description:
    "A walkthrough of the calm yearly system: Wheel of Life, Projects, Anti-goals, Daily systems, Rhythm reviews, and Year Wrapped.",
}

const STEPS = [
  {
    n: "01",
    word: "Wheel of Life",
    title: "Start with how the year actually feels.",
    body: "Six life areas, scored honestly. The Wheel anchors every plan — so you're not optimizing the loud thing while the quiet thing dies.",
  },
  {
    n: "02",
    word: "Projects",
    title: "A few projects, chosen on purpose.",
    body: "Free plans cap projects at 3 — the discipline of fewer. Pick the outcomes you'll actually move on this year, not the list that impresses you.",
  },
  {
    n: "03",
    word: "Anti-goals",
    title: "The quiet noes that protect the year.",
    body: "Anti-goals are the things you've decided, on purpose, not to chase. Each one frees room for the few yeses that matter.",
  },
  {
    n: "04",
    word: "Daily systems",
    title: "Habits that quietly compound.",
    body: "Up to 3 daily systems per project on Free, up to 10 on Pro. Tap to mark done — small reps, no streak shame.",
  },
  {
    n: "05",
    word: "Today",
    title: "One calm surface for the day.",
    body: "Today shows only the habits you committed to. A place to land before the day pulls — two minutes, then close the tab.",
  },
  {
    n: "06",
    word: "Rhythm",
    title: "Weekly · Monthly · Quarterly.",
    body: "Three nested cadences. Five-minute weekly review, deeper monthly recalibration, quarterly season reset. Recap cards you'd actually share.",
  },
  {
    n: "07",
    word: "Wrapped",
    title: "End the year with proof.",
    body: "An animated, shareable Year Wrapped of how you actually lived your plan. On Pro, the full archive of every reflection, win, and lesson.",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <section className="container pt-14 md:pt-20 pb-10 md:pb-14">
        <div className="max-w-xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            How we think about the year,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            A loop, not a dashboard.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            YearInReview connects yearly intention to weekly execution to daily
            presence — through one quiet system you can keep.
          </p>
        </div>
      </section>

      <OrnamentDivider variant="seed" className="container max-w-2xl" />

      <section className="container py-14 md:py-20">
        <ol className="max-w-2xl space-y-12 md:space-y-14">
          {STEPS.map((s) => (
            <li
              key={s.word}
              className="grid grid-cols-[3rem_1fr] gap-x-5 md:gap-x-8"
            >
              <span className="font-display text-xl text-amber tabular-nums mt-1 leading-none">
                {s.n}
              </span>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{s.word}</p>
                <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug text-foreground">
                  {s.title}
                </h2>
                <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <CtaBand />
    </>
  )
}
