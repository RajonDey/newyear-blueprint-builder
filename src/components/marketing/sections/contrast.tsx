import { Check, X } from "lucide-react"

const WITHOUT = [
  "Goals scattered across notes, tabs, and good intentions",
  "January energy that fades by week six",
  "No record of what actually happened, or why",
  "December arrives without a story to tell",
]

const WITH = [
  "One calm place where the plan lives all year",
  "A weekly rhythm that keeps the plan honest",
  "Reflections, check-ins, and recaps quietly compounding",
  "A year-end Wrapped you'll actually want to keep",
]

export function Contrast() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center mb-14">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
          Two Decembers
        </div>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
          The same twelve months. A different ending.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-7">
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">
            Without YearInReview
          </div>
          <ul className="space-y-3">
            {WITHOUT.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <X className="h-3 w-3" />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-amber/40 bg-gradient-to-br from-amber/[0.05] via-card to-card p-7">
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber mb-5">
            With YearInReview
          </div>
          <ul className="space-y-3">
            {WITH.map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber/15 text-amber">
                  <Check className="h-3 w-3" />
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
