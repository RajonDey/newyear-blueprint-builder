import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SoftBackdrop } from "@/components/atmosphere/soft-backdrop"
import { getCurrentYear } from "@/lib/utils"

export function Hero() {
  const year = getCurrentYear()
  return (
    <section className="relative overflow-hidden">
      <SoftBackdrop />
      <div className="container relative py-24 md:py-36 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="text-amber leading-none">✦</span>
          Plan {year} once — execute it all year
        </div>
        <h1 className="mx-auto max-w-4xl font-display text-5xl md:text-7xl leading-[1.02] tracking-tight text-foreground">
          End the year proud —{" "}
          <span className="text-muted-foreground/80">with</span>{" "}
          <em className="not-italic text-amber">proof</em>.
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
          Most resolutions die in February. YearInReview connects your{" "}
          <span className="text-foreground">yearly plan</span>,{" "}
          <span className="text-foreground">weekly rhythm</span>, and{" "}
          <span className="text-foreground">daily systems</span> in one calm place —
          so intentions turn into habits, not guilt.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" className="gap-2 px-8 h-12 text-base" asChild>
            <Link href="/signup">
              Start free — create your plan <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="ghost" className="px-8 h-12 text-base" asChild>
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <li className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber" /> Free onboarding, no card
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber" /> Weekly plan + review in one flow
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-amber" /> Pro adds depth &amp; analytics
          </li>
        </ul>
      </div>
    </section>
  )
}
