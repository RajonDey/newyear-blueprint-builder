import type { Metadata } from "next"
import {
  CircleDot,
  Layers,
  Repeat,
  Sun,
  CalendarDays,
  NotebookPen,
  Gift,
} from "lucide-react"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { CtaBand } from "@/components/marketing/sections/cta-band"

export const metadata: Metadata = {
  title: "How it works",
  description:
    "A walkthrough of the calm yearly system: Wheel of Life, Projects, Anti-goals, Daily systems, Rhythm reviews, and Year Wrapped.",
}

const STEPS = [
  {
    icon: CircleDot,
    label: "Wheel of Life",
    title: "Start with how the year actually feels.",
    body: "Six life areas, scored honestly. The Wheel anchors every plan — so you're not optimizing the loud thing while the quiet thing dies.",
  },
  {
    icon: Layers,
    label: "Projects",
    title: "A few projects, chosen on purpose.",
    body: "Free plans cap projects at 3 — the discipline of fewer. Pick the outcomes you'll actually move on this year, not the list that impresses you.",
  },
  {
    icon: NotebookPen,
    label: "Anti-goals",
    title: "The quiet noes that protect the year.",
    body: "Anti-goals are the things you've decided, on purpose, not to chase. Each one frees room for the few yeses that matter.",
  },
  {
    icon: Repeat,
    label: "Daily systems",
    title: "Habits that quietly compound.",
    body: "Up to 3 daily systems per project on Free, up to 10 on Pro. Tap to mark done — small reps, no streak shame.",
  },
  {
    icon: Sun,
    label: "Today",
    title: "One calm surface for the day.",
    body: "Today shows only the habits you committed to. A place to land before the day pulls — two minutes, then close the tab.",
  },
  {
    icon: CalendarDays,
    label: "Rhythm",
    title: "Weekly · Monthly · Quarterly.",
    body: "Three nested cadences. Five-minute weekly review, deeper monthly recalibration, quarterly season reset. Recap cards you'd actually share.",
  },
  {
    icon: Gift,
    label: "Wrapped",
    title: "End the year with proof.",
    body: "An animated, shareable Year Wrapped of how you actually lived your plan. On Pro, the full archive of every reflection, win, and lesson.",
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <section className="container py-24 md:py-32 text-center">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
          How it works
        </div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05] max-w-3xl mx-auto">
          A loop, not a dashboard.
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          YearInReview connects yearly intention to weekly execution to daily
          presence — through one quiet system you can keep.
        </p>
      </section>

      <OrnamentDivider variant="seed" className="container max-w-2xl" />

      <section className="container pb-12">
        <div className="max-w-3xl mx-auto space-y-16">
          {STEPS.map((s, i) => (
            <article
              key={s.label}
              className="grid md:grid-cols-[auto_1fr] gap-6 items-start"
            >
              <div className="flex items-center gap-4 md:flex-col md:items-start">
                <div className="h-12 w-12 rounded-2xl bg-amber/10 text-amber flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-xs text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                  {s.label}
                </div>
                <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug mb-3">
                  {s.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
