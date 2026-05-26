import { YearLoopDiagram } from "@/components/marketing/year-loop-diagram"

/* Hallmark · design-system: design.md · designed-as-app
 * Plan section — steps + year loop diagram in split layout.
 */

const STEPS = [
  {
    n: "01",
    word: "Reflect",
    body:
      "Sit with the year as it is — wins, drift, and the quiet moments you almost forgot.",
  },
  {
    n: "02",
    word: "Plan",
    body:
      "Translate clarity into a small set of goals, anti-goals, and a Wheel of Life that holds.",
  },
  {
    n: "03",
    word: "Live",
    body:
      "A weekly rhythm and a daily Today surface — small, repeatable, kept.",
  },
  {
    n: "04",
    word: "Review",
    body:
      "Recap cards each week, month, quarter — and a year-end Wrapped worth keeping.",
  },
]

export function Plan() {
  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
            One loop. Four moves. The whole year.
          </h2>
          <ol className="mt-12 space-y-10">
            {STEPS.map((s) => (
              <li
                key={s.word}
                className="grid grid-cols-[3rem_1fr] gap-x-5 md:gap-x-7"
              >
                <span className="font-display text-xl text-amber tabular-nums mt-1 leading-none">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl tracking-tight text-foreground leading-tight">
                    {s.word}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-border/70 p-6 md:p-10">
          <YearLoopDiagram />
        </div>
      </div>
    </section>
  )
}
