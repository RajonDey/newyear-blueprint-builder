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
} from "lucide-react"

export default function HomePage() {
  const year = getCurrentYear()

  return (
    <div className="flex flex-col items-center">
      {/* ── Hero Section ── */}
      <section className="relative w-full py-24 md:py-36 overflow-hidden">
        <MandalaWatermark size="lg" position="center" />
        <div className="container relative z-10 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-5 py-2 text-sm text-muted-foreground">
            <Leaf className="h-3.5 w-3.5 text-accent" />
            <span>Your {year} begins with intention</span>
          </div>

          <h1 className="max-w-3xl text-4xl font-display font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl leading-[1.15]">
            Design a Life{" "}
            <span className="text-gradient-brand">Worth Living</span>
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
            A mindful annual planning platform. Reflect on your journey,
            set intentional goals, and walk your path with clarity —
            all year long.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                Begin Your Journey
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8">
                Explore the Path
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground/70">
            Free to begin &middot; No credit card required &middot; Your journey, your pace
          </p>
        </div>
      </section>

      <OrnamentDivider variant="wheat" className="container max-w-2xl" />

      {/* ── Philosophy Section ── */}
      <section className="w-full py-20">
        <div className="container max-w-3xl text-center space-y-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            The Philosophy
          </h2>
          <p className="text-2xl md:text-3xl font-display text-foreground leading-relaxed">
            &ldquo;You do not rise to the level of your goals. You fall to the
            level of your systems.&rdquo;
          </p>
          <p className="text-sm text-muted-foreground">— James Clear</p>
        </div>
      </section>

      <OrnamentDivider variant="dot" className="container max-w-2xl" />

      {/* ── How It Works ── */}
      <section className="relative w-full py-20 overflow-hidden">
        <MandalaWatermark size="md" position="top-right" className="opacity-[0.03]" />
        <div className="container relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
              The Journey
            </h2>
            <h3 className="text-3xl md:text-4xl font-display text-foreground">
              A Year of Intentional Living
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Compass,
                title: "Reflect & Discover",
                description:
                  "Begin with the Wheel of Life. Understand where you are before deciding where to go.",
                period: "December — January",
              },
              {
                icon: Target,
                title: "Plan with Purpose",
                description:
                  "Set meaningful goals, define daily systems, and anchor them in your deeper why.",
                period: "January",
              },
              {
                icon: CalendarCheck,
                title: "Walk the Path",
                description:
                  "Weekly check-ins, quarterly reviews, and daily systems keep your vision alive.",
                period: "All Year",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="relative bg-card border rounded-lg p-8 text-center space-y-4 bg-lotus-corner"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h4 className="text-lg font-display font-semibold text-foreground">
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                <p className="text-xs font-medium uppercase tracking-wider text-accent/70">
                  {step.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentDivider variant="leaf" className="container max-w-2xl" />

      {/* ── Features Section ── */}
      <section className="w-full py-20">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
              Built for Depth
            </h2>
            <h3 className="text-3xl md:text-4xl font-display text-foreground">
              Everything Your Year Needs
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Compass,
                title: "Wheel of Life",
                desc: "Rate six life areas and discover where to focus your energy this year.",
              },
              {
                icon: Target,
                title: "Intentional Goals",
                desc: "Set Big Goals, define Anti-Goals, and create quarterly checkpoint milestones.",
              },
              {
                icon: Leaf,
                title: "Daily Systems",
                desc: "Build 2-3 daily actions that compound into transformative yearly results.",
              },
              {
                icon: CalendarCheck,
                title: "Weekly Check-ins",
                desc: "60 seconds every week to reflect, rate progress, and stay on path.",
              },
              {
                icon: BarChart3,
                title: "Progress Insights",
                desc: "Watch your Wheel of Life evolve over time with beautiful visualizations.",
              },
              {
                icon: Sparkles,
                title: "Year Wrapped",
                desc: "In December, see a complete summary of your journey — shareable and beautiful.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-lg border p-6 space-y-3 hover:border-accent/30 transition-colors"
              >
                <feature.icon className="h-5 w-5 text-accent" />
                <h4 className="font-display font-semibold text-foreground">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrnamentDivider variant="lotus" className="container max-w-2xl" />

      {/* ── CTA Section ── */}
      <section className="relative w-full py-24 overflow-hidden">
        <MandalaWatermark size="lg" position="bottom-left" className="opacity-[0.03]" />
        <div className="container relative z-10 max-w-2xl text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-display text-foreground leading-relaxed">
            Your most intentional year begins with a single step
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Join thousands who plan their year with purpose — not just ambition.
            Free forever. Upgrade when you&apos;re ready for more depth.
          </p>
          <Link href="/signup">
            <Button size="lg" className="px-10">
              Begin Your Journey — It&apos;s Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
