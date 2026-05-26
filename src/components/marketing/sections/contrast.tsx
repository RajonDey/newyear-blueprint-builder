/* Hallmark · design-system: design.md · designed-as-app
 * Two Decembers — typographic diptych, full container width.
 */

const WITHOUT = [
  "Goals scattered across notes, tabs, and good intentions.",
  "January energy that fades by week six.",
  "No record of what actually happened, or why.",
  "December arrives without a story to tell.",
]

const WITH_YIR = [
  "One calm place where the plan lives all year.",
  "A weekly rhythm that keeps the plan honest.",
  "Reflections, check-ins, and recaps quietly compounding.",
  "A year-end Wrapped you\u2019ll actually want to keep.",
]

export function Contrast() {
  return (
    <section className="border-y border-border/60 bg-secondary/25 py-20 md:py-28">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
            The same twelve months.
            <br />
            <span className="text-muted-foreground/80">A different ending.</span>
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-24 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/80 bg-card/60 p-8 md:p-10">
            <p className="font-display italic text-base text-muted-foreground mb-6">
              Without a system —
            </p>
            <ul className="space-y-4">
              {WITHOUT.map((t) => (
                <li
                  key={t}
                  className="text-base text-muted-foreground leading-relaxed"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber/30 bg-amber-tint p-8 md:p-10 border-l-4 border-l-amber">
            <p className="font-display italic text-base text-amber mb-6">
              With YearInReview —
            </p>
            <ul className="space-y-4">
              {WITH_YIR.map((t) => (
                <li
                  key={t}
                  className="text-base text-foreground leading-relaxed"
                >
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
