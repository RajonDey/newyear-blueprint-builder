import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { getCurrentYear } from "@/lib/utils"
import {
  Target,
  CalendarCheck,
  BarChart3,
  Sparkles,
  Compass,
  Leaf,
  ListChecks,
  ArrowRight,
  Lightbulb,
  Repeat,
  TrendingUp,
} from "lucide-react"

export const metadata: Metadata = {
  title: "YearInReview — Annual planning that lasts all year",
  description:
    "Reflect with the Wheel of Life, build a yearly plan with goals and systems, then stay consistent with weekly rhythm and daily habits. Free to start.",
  openGraph: {
    title: "YearInReview — Design a life worth living",
    description:
      "Turn a day of reflection into a year of follow-through. Planning workspace for goals, weekly rhythm, and daily systems.",
  },
}

export default function HomePage() {
  const year = getCurrentYear()

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
        <MandalaWatermark size="lg" position="center" />
        <div className="container relative z-10 flex flex-col items-center text-center gap-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-5 py-2 text-sm text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>Plan {year} once—execute it all year</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-display font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.12]">
            Design a life worth living—{" "}
            <span className="text-gradient-brand">then actually live it</span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            Most resolutions die in February. YearInReview connects your{" "}
            <strong className="font-medium text-foreground">yearly plan</strong>,{" "}
            <strong className="font-medium text-foreground">weekly rhythm</strong>, and{" "}
            <strong className="font-medium text-foreground">daily systems</strong> in one place—so
            your intentions turn into habits, not guilt.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto mt-2">
            <Button size="lg" className="px-8 h-12 text-base" asChild>
              <Link href="/signup">Start free — create your plan</Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-12 text-base" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
            <Button size="lg" variant="ghost" className="px-6 h-12 text-base hidden sm:inline-flex" asChild>
              <Link href="/features" className="gap-1">
                All features <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="sm:hidden">
            <Link href="/features" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              View all features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>

          <ul className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
            <li className="flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Free wizard &amp; 3 goals — no card
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Weekly plan + review in one flow
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              Pro adds quarterly depth &amp; analytics
            </li>
          </ul>
        </div>
      </section>

      <OrnamentDivider variant="wheat" className="container max-w-2xl" />

      {/* Positioning: outcomes */}
      <section className="w-full py-20 md:py-24" aria-labelledby="why-heading">
        <div className="container max-w-5xl">
          <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
            <h2 id="why-heading" className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Why it works
            </h2>
            <p className="text-3xl md:text-4xl font-display text-foreground leading-tight">
              Clarity once a year. Follow-through every week.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Big planners still fail when execution is scattered across notes apps and memory.
              YearInReview is built around a simple loop:{" "}
              <span className="text-foreground font-medium">reflect → plan → act → review</span>.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "See the whole picture",
                body: "Wheel of Life and guided reflection help you choose a few priorities—not ten competing resolutions.",
              },
              {
                icon: Repeat,
                title: "Stay in motion",
                body: "Weekly rhythm: set priorities for the week, protect what matters, then reflect and carry a note into the next week.",
              },
              {
                icon: TrendingUp,
                title: "Compound in small reps",
                body: "Daily systems tied to goals turn your plan into repeatable actions—where real change actually happens.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border bg-card/50 p-8 space-y-4 text-center md:text-left bg-lotus-corner"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto md:mx-0">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentDivider variant="dot" className="container max-w-2xl" />

      {/* Philosophy */}
      <section className="w-full py-16 md:py-20">
        <div className="container max-w-3xl text-center space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">The philosophy</p>
          <blockquote className="text-2xl md:text-3xl font-display text-foreground leading-relaxed">
            &ldquo;You do not rise to the level of your goals. You fall to the level of your
            systems.&rdquo;
          </blockquote>
          <p className="text-sm text-muted-foreground">— James Clear</p>
        </div>
      </section>

      <OrnamentDivider variant="dot" className="container max-w-2xl" />

      {/* Journey */}
      <section className="relative w-full py-20 overflow-hidden">
        <MandalaWatermark size="md" position="top-right" className="opacity-[0.03]" />
        <div className="container relative z-10">
          <div className="text-center space-y-4 mb-14 max-w-2xl mx-auto">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">The journey</h2>
            <p className="text-3xl md:text-4xl font-display text-foreground">From blank page to a year on purpose</p>
            <p className="text-muted-foreground leading-relaxed">
              One guided flow takes you from reflection to a plan you can execute—not a PDF you never open again.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Compass,
                title: "Reflect & discover",
                description:
                  "Honor the past year and score the Wheel of Life so you know where to focus—not just what sounds impressive.",
                period: "Start here",
              },
              {
                icon: Target,
                title: "Plan with purpose",
                description:
                  "Goals with meaning, anti-goals for boundaries, quarterly checkpoints, and daily systems that support the life you want.",
                period: "Your blueprint",
              },
              {
                icon: CalendarCheck,
                title: "Walk the path",
                description:
                  "Each week: plan priorities, check in, and let daily systems keep momentum. Pro unlocks quarterly reviews and deeper analytics.",
                period: "All year",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="relative bg-card border rounded-lg p-8 text-center space-y-4 bg-lotus-corner"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground capitalize">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-accent/80">{step.period}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-10">
            <Button variant="outline" asChild>
              <Link href="/features" className="gap-2">
                Explore every feature <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </p>
        </div>
      </section>

      <OrnamentDivider variant="leaf" className="container max-w-2xl" />

      {/* Product capabilities */}
      <section id="product" className="w-full py-20 scroll-mt-24">
        <div className="container">
          <div className="text-center space-y-4 mb-14 max-w-2xl mx-auto">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">What you get</h2>
            <p className="text-3xl md:text-4xl font-display text-foreground">Depth without overwhelm</p>
            <p className="text-muted-foreground leading-relaxed">
              Everything below is designed to work together. Free covers the full planning arc; Pro adds rhythm
              for serious stewards of their year.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Compass,
                title: "Wheel of Life",
                desc: "Six life areas, honest scores, and context—so your goals match reality, not vibes.",
              },
              {
                icon: Target,
                title: "Goals & anti-goals",
                desc: "Primary and secondary goals plus boundaries: what you are choosing not to chase this year.",
              },
              {
                icon: ListChecks,
                title: "Daily systems",
                desc: "Small recurring actions per goal so progress shows up in your week, not only on January 1.",
              },
              {
                icon: CalendarCheck,
                title: "Weekly rhythm",
                desc: "Plan the week (priorities + commitments), reflect, and leave a note for your future self.",
              },
              {
                icon: BarChart3,
                title: "Progress & analytics",
                desc: "See how your wheel and habits evolve. Full analytics on Pro.",
                tag: "Pro",
              },
              {
                icon: Sparkles,
                title: "Year Wrapped",
                desc: "A beautiful end-of-year summary of how you lived your plan—shareable when you want to.",
                tag: "Pro highlights",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border p-6 space-y-3 hover:border-accent/35 transition-colors text-left"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <feature.icon className="h-5 w-5 text-accent shrink-0" />
                  {feature.tag && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {feature.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier teaser */}
      <section className="w-full py-16 md:py-20 bg-muted/30 border-y border-border/60">
        <div className="container max-w-4xl">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Simple pricing</h2>
            <p className="text-2xl md:text-3xl font-display text-foreground">Start free. Go deeper when it clicks.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-background p-8 space-y-4">
              <h3 className="font-display text-lg font-semibold">Free</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full wizard, Wheel of Life, up to three goals, weekly rhythm, daily systems, streaks, and PDF
                export—enough to run a serious year without paying.
              </p>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/signup">Create free account</Link>
              </Button>
            </div>
            <div className="rounded-lg border-2 border-accent/30 bg-background p-8 space-y-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                Pro <Sparkles className="h-4 w-4 text-accent" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlimited goals, quarterly review, advanced analytics, AI planning coach, accountability
                sharing, streak shields, and premium Year Wrapped—when you want the full studio.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/pricing">Compare on pricing</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/signup">Sign up free first</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative w-full py-24 md:py-28 overflow-hidden">
        <MandalaWatermark size="lg" position="bottom-left" className="opacity-[0.03]" />
        <div className="container relative z-10 max-w-2xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-display text-foreground leading-snug">
            {year} is still yours to write
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            Take an hour to plan with intention—then let the product carry the rest. No credit card to begin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="px-10 h-12 text-base" asChild>
              <Link href="/signup">Begin your journey</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
