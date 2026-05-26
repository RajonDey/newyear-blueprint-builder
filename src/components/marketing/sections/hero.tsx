import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { SoftBackdrop } from "@/components/atmosphere/soft-backdrop"
import { MarketingHeroVisual } from "@/components/marketing/marketing-hero-visual"
import { Button } from "@/components/ui/button"
import { getCurrentYear } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Split hero — editorial lede left, mandala centerpiece right (design.md §11).
 *
 * Keeps the calm letter voice but fills the viewport with Tier-A enrichment
 * so the page reads alive, not empty.
 */

export function Hero() {
  const year = getCurrentYear()

  return (
    <section className="relative overflow-hidden">
      <SoftBackdrop intensity="soft" />
      <div className="container relative pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="max-w-xl lg:max-w-none">
            <p className="font-display italic text-lg md:text-xl text-muted-foreground">
              Dear reader,
            </p>
            <h1 className="mt-6 font-display text-4xl md:text-5xl xl:text-[3.25rem] leading-[1.06] tracking-tight text-foreground">
              Most resolutions die in February. Ours did too — until we stopped
              keeping plans in one place and life in another.
            </h1>
            <div className="mt-8 space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              <p>
                YearInReview is the calm system between your{" "}
                <span className="text-foreground">ambition</span> and your{" "}
                <span className="text-foreground">week</span>. One place where
                the year you{"\u2019"}re planning, the rhythm you{"\u2019"}re
                keeping, and the small things you{"\u2019"}re doing today all
                live together.
              </p>
              <p>
                We{"\u2019"}re writing this in {year}. We made it for the
                version of you in December — the one who wants to look back
                and find proof.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start a plan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Link
                href="/how-it-works"
                className="text-sm text-muted-foreground underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-foreground transition-colors"
              >
                See how it works
              </Link>
            </div>
          </div>

          <div className="relative lg:justify-self-end lg:w-full lg:max-w-[520px]">
            <MarketingHeroVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
