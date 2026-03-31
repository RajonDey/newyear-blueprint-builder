import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import {
  Compass,
  Target,
  Ban,
  CalendarRange,
  ListChecks,
  CalendarCheck,
  BarChart3,
  Sparkles,
  FileDown,
  Flame,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Features",
  description:
    "YearInReview features: Wheel of Life, yearly planning wizard, goals, daily systems, weekly rhythm, quarterly reviews (Pro), analytics, and Year Wrapped.",
}

type Tier = "free" | "pro"

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "free")
    return (
      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground bg-secondary px-2 py-0.5 rounded">
        Free
      </span>
    )
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-foreground bg-accent px-2 py-0.5 rounded">
      Pro
    </span>
  )
}

export default function FeaturesPage() {
  return (
    <div className="relative overflow-hidden">
      <MandalaWatermark size="lg" position="top-right" className="opacity-[0.04]" />
      <div className="container py-16 md:py-24 max-w-4xl">
        <header className="text-center space-y-4 mb-12 max-w-2xl mx-auto">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Features</p>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground leading-tight">
            Everything in one intentional workspace
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Plan the year once, then live it through systems, weekly rhythm, and (with Pro) quarterly
            recalibration—without juggling five different apps.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild>
              <Link href="/signup">Start free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </header>

        <OrnamentDivider variant="lotus" className="max-w-xs mx-auto mb-16" />

        <div className="space-y-16">
          <FeatureBlock
            title="Plan your year"
            intro="A guided wizard takes you from reflection to a concrete blueprint—not a vague resolution list."
            items={[
              {
                icon: Compass,
                title: "Wheel of Life",
                tier: "free",
                text: "Score six life areas and add context so priorities reflect your real life.",
              },
              {
                icon: Target,
                title: "Goals & checkpoints",
                tier: "free",
                text: "Primary and secondary goals with quarterly milestones to break the year into chapters.",
              },
              {
                icon: Ban,
                title: "Anti-goals",
                tier: "free",
                text: "Name what you are not optimizing for—protecting focus and energy.",
              },
              {
                icon: ListChecks,
                title: "Systems per goal",
                tier: "free",
                text: "Attach daily or recurring systems so each goal has a practical engine.",
              },
              {
                icon: FileDown,
                title: "Plan overview",
                tier: "free",
                text: "See your full plan at a glance — goals, checkpoints, systems, and anti-goals in one view.",
              },
            ]}
          />

          <FeatureBlock
            title="Execute week to week"
            intro="The gap between plan and life is where most tools stop. YearInReview stays with you in the messy middle."
            items={[
              {
                icon: CalendarCheck,
                title: "Weekly planner",
                tier: "free",
                text: "Set weekly priorities, note what to protect, log core and follow-up commitments, then reflect. Carry a “looking ahead” note into the next week.",
              },
              {
                icon: ListChecks,
                title: "Daily habits tracker",
                tier: "free",
                text: "See today’s systems, complete them with one tap, and surface this week’s focus next to your goals.",
              },
              {
                icon: Flame,
                title: "Streaks & achievements",
                tier: "free",
                text: "Lightweight accountability that rewards showing up—not perfection.",
              },
            ]}
          />

          <FeatureBlock
            title="Go deeper with Pro"
            intro="When you want analytics, quarterly structure, and premium wrap-ups."
            items={[
              {
                icon: CalendarRange,
                title: "Quarterly review",
                tier: "pro",
                text: "Per-quarter reflection: wins, challenges, adjustments, with a snapshot of your Wheel of Life.",
              },
              {
                icon: BarChart3,
                title: "Advanced analytics",
                tier: "pro",
                text: "Deeper progress views to see how your year is trending—not just how today felt.",
              },
              {
                icon: Sparkles,
                title: "Year Wrapped",
                tier: "pro",
                text: "A rich end-of-year summary of how you lived your plan — shareable and motivating.",
              },
            ]}
          />
        </div>

        <OrnamentDivider variant="dot" className="max-w-xs mx-auto my-16" />

        <section className="rounded-xl border bg-card/60 p-8 md:p-10 text-center space-y-6 bg-lotus-corner">
          <h2 className="text-2xl font-display font-semibold text-foreground">Ready to try it?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Create an account in a minute. Build your plan when you have a quiet hour—your progress saves as you go.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">Create free account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

function FeatureBlock({
  title,
  intro,
  items,
}: {
  title: string
  intro: string
  items: {
    icon: typeof Compass
    title: string
    text: string
    tier: Tier
  }[]
}) {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground">{title}</h2>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">{intro}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.title}
            className="flex gap-4 rounded-lg border border-border/80 bg-background/80 p-5 text-left"
          >
            <div className="shrink-0 flex flex-col items-start gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </span>
              <TierBadge tier={item.tier} />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
