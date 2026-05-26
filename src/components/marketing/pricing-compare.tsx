/* Hallmark · design-system: design.md · designed-as-app
 * F3 tabular spec sheet — hairline rows, tabular numerics (Wave E).
 */

import { Check, Minus } from "lucide-react"
import { marketingPlanCopy as m } from "@/lib/marketing-plan-copy"

type CellValue = string | boolean

interface CompareRow {
  label: string
  free: CellValue
  pro: CellValue
}

const ROWS: CompareRow[] = [
  { label: "Life areas", free: "6", pro: "Up to 50" },
  {
    label: "Active projects",
    free: String(m.freeProjects),
    pro: String(m.proProjects),
  },
  {
    label: "Anti-goals",
    free: String(m.freeAntiGoals),
    pro: String(m.proAntiGoals),
  },
  {
    label: "Daily systems per project",
    free: String(m.freeSystemsPerProject),
    pro: String(m.proSystemsPerProject),
  },
  { label: "Wheel of Life — six areas, honest scoring", free: true, pro: true },
  { label: m.onboardingLabel, free: true, pro: true },
  { label: "Daily Habits surface + streak tracking", free: true, pro: true },
  { label: "Weekly check-in + recap card", free: true, pro: true },
  { label: "Monthly reviews + recap card", free: false, pro: true },
  { label: "Quarterly reviews + recap card", free: false, pro: true },
  { label: "Advanced analytics — habits, mood, trends", free: false, pro: true },
  { label: "Year Wrapped — animated, shareable", free: "Summary", pro: "Full" },
  { label: "Achievements & badges", free: true, pro: true },
  { label: "Multi-year plan history", free: true, pro: true },
  {
    label: "JSON export — your year, portable",
    free: true,
    pro: true,
  },
  { label: "Priority support", free: false, pro: true },
]

function Cell({ value }: { value: CellValue }) {
  if (value === true)
    return (
      <span
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-tint text-amber"
        aria-label="Included"
      >
        <Check className="h-3 w-3" />
      </span>
    )
  if (value === false)
    return (
      <Minus
        className="h-3.5 w-3.5 text-muted-foreground/50"
        aria-label="Not included"
      />
    )
  return <span className="text-sm tabular-nums text-foreground">{value}</span>
}

export function PricingCompare() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[32rem] border-y border-border">
        <div className="grid grid-cols-[1.6fr_1fr_1fr] border-b border-border text-xs font-medium text-muted-foreground">
          <div className="py-3 pr-4">Feature</div>
          <div className="py-3 text-center">Free</div>
          <div className="py-3 text-center text-foreground">Pro</div>
        </div>
        <ul>
          {ROWS.map((r) => (
            <li
              key={r.label}
              className="grid grid-cols-[1.6fr_1fr_1fr] items-center border-b border-border last:border-b-0 text-sm"
            >
              <div className="py-3.5 pr-4 text-foreground/90">{r.label}</div>
              <div className="py-3.5 flex justify-center">
                <Cell value={r.free} />
              </div>
              <div className="py-3.5 flex justify-center">
                <Cell value={r.pro} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
