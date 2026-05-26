import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { marketingPlanCopy as m } from "@/lib/marketing-plan-copy"

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
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center mb-12">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
          Pricing
        </div>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
          Free is real. Pro is for the year you want proof of.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        <Tier name="Free" price="$0" cadence="forever" features={FREE} />
        <Tier
          name="Pro"
          price="$59"
          cadence="/ year"
          features={PRO}
          highlight
        />
      </div>
      <div className="mt-10 text-center">
        <Button variant="ghost" asChild>
          <Link href="/pricing">See full comparison →</Link>
        </Button>
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
        "rounded-2xl border p-7",
        highlight
          ? "border-amber/40 bg-gradient-to-br from-amber/[0.05] via-card to-card"
          : "border-border bg-card",
      )}
    >
      <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {name}
      </div>
      <div className="flex items-baseline gap-2 mb-5">
        <span className="font-display text-4xl tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </div>
      <ul className="space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                highlight ? "bg-amber/15 text-amber" : "bg-secondary text-muted-foreground",
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
