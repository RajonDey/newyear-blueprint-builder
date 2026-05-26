import Link from "next/link"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { marketingPlanCopy as m } from "@/lib/marketing-plan-copy"

/* Hallmark · design-system: design.md · designed-as-app
 * Pricing teaser — centred heading, balanced two-tier cards.
 */

const FREE = [
  "Whole loop, every week",
  `6 areas · ${m.freeProjects} projects · ${m.freeSystemsPerProject} systems per project`,
  "Streaks, weekly review, daily habits",
]
const PRO = [
  `Up to ${m.proProjects} projects · ${m.proAntiGoals} anti-goals`,
  "Monthly + Quarterly reviews",
  "Analytics + annual Year Wrapped",
]

export function PricingTeaser() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
          Free is real.
          <br />
          <span className="text-muted-foreground/80">
            Pro is for the year you want proof of.
          </span>
        </h2>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        <Tier name="Free" price="$0" cadence="forever" features={FREE} />
        <Tier
          name="Pro"
          price="$59"
          cadence="/ year"
          features={PRO}
          highlight
        />
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/pricing"
          className="text-sm text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
        >
          See full comparison →
        </Link>
      </div>
    </section>
  )
}

function Tier({
  name,
  price,
  cadence,
  features,
  highlight,
}: {
  name: string
  price: string
  cadence: string
  features: string[]
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-7 md:p-8",
        highlight
          ? "border-amber/40 bg-amber-tint shadow-sm"
          : "border-border bg-card shadow-sm",
      )}
    >
      <div className="font-display italic text-base text-foreground mb-2">
        {name}
      </div>
      <div className="flex items-baseline gap-2 mb-5">
        <span className="font-display text-4xl tracking-tight tabular-nums">
          {price}
        </span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                highlight
                  ? "bg-amber-emphasis text-amber"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <Check className="h-3 w-3" />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
