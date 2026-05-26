"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Pricing tiers — Letter voice, balanced two-column (Wave E).
 */

import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { marketingPlanCopy as m } from "@/lib/marketing-plan-copy"

const FREE_FEATURES = [
  "Daily Habits surface — your today, calmly",
  "Wheel of Life — six areas, honest scoring",
  `Up to ${m.freeProjects} projects · ${m.freeAntiGoals} anti-goals · ${m.freeSystemsPerProject} systems per project`,
  "Weekly check-in + shareable weekly recap card",
  "Streaks, achievements, and habit heatmap",
  "Multi-year plan history",
  `JSON export — ${m.jsonExportLabel.toLowerCase()}`,
]

const PRO_FEATURES = [
  `Up to ${m.proProjects} projects · ${m.proAntiGoals} anti-goals · ${m.proSystemsPerProject} systems per project`,
  "Monthly + Quarterly reviews with deeper prompts",
  "Monthly + Quarterly recap cards",
  "Advanced analytics — habits, mood, and trends",
  "Annual Year Wrapped — animated and shareable",
  "Priority support",
]

type Cycle = "monthly" | "annual"

export function PricingPlans() {
  const [cycle, setCycle] = useState<Cycle>("annual")

  const isAnnual = cycle === "annual"
  const proPrice = isAnnual ? m.proAnnualPrice : m.proMonthlyLabel
  const proCadence = isAnnual ? "/ year · save $49" : "Monthly billing · launching soon"

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-md border border-border bg-card p-1 text-sm">
          {(["monthly", "annual"] as Cycle[]).map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "px-4 py-1.5 rounded-sm transition-colors capitalize",
                cycle === c
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
              {c === "annual" && (
                <span className="ml-1.5 text-xs text-amber">save 45%</span>
              )}
              {c === "monthly" && (
                <span className="ml-1.5 text-xs text-muted-foreground">soon</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        <PlanCard
          name="Year Companion"
          price="Free"
          cadence="forever"
          tagline="Everything you need to actually live the plan."
          features={FREE_FEATURES}
          footnote="Not on Free: Monthly & Quarterly reviews, advanced analytics, full Year Wrapped."
          cta={
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Begin free</Link>
            </Button>
          }
        />
        <PlanCard
          name="Year Architect"
          price={proPrice}
          cadence={proCadence}
          tagline={
            isAnnual
              ? "The whole year, deeper. The Wrapped you'll actually share."
              : "Monthly Pro is on the way — annual is available now."
          }
          features={PRO_FEATURES}
          highlight
          cta={
            isAnnual ? (
              <Button className="w-full" asChild>
                <Link href="/signup">Upgrade to Pro</Link>
              </Button>
            ) : (
              <Button className="w-full" variant="secondary" disabled>
                Coming soon
              </Button>
            )
          }
        />
      </div>

      <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
        Calm by design. No upsells in your reflection. Cancel anytime — JSON
        export is in Settings for Free and Pro.
      </p>
    </div>
  )
}

function PlanCard({
  name,
  price,
  cadence,
  tagline,
  features,
  cta,
  highlight,
  footnote,
}: {
  name: string
  price: string
  cadence: string
  tagline: string
  features: string[]
  cta: React.ReactNode
  highlight?: boolean
  footnote?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col border p-7 md:p-8",
        highlight ? "border-amber/40 bg-amber-tint" : "border-border bg-card",
      )}
    >
      <div className="mb-5">
        <div className="font-display italic text-base text-foreground mb-2">
          {name}
        </div>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-display text-4xl md:text-5xl tracking-tight tabular-nums">
            {price}
          </span>
          <span className="text-sm text-muted-foreground">{cadence}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {tagline}
        </p>
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
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

      {footnote && (
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          {footnote}
        </p>
      )}

      {cta}
    </div>
  )
}
