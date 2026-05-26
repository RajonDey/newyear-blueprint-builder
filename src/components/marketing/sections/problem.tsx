import { ScatterOrbitVisual } from "@/components/marketing/scatter-orbit-visual"

/* Hallmark · design-system: design.md · designed-as-app
 * Problem section — split layout with animated scatter→orbit visual (§11).
 */

const PROBLEMS = [
  {
    title: "January energy, gone by March.",
    body:
      "You set thoughtful goals — then life scatters them across notes, tabs, and forgotten resolutions.",
  },
  {
    title: "Plans that don\u2019t reach Tuesday.",
    body:
      "Annual planning lives in one tool. Daily life lives in another. The two never meet.",
  },
  {
    title: "Dashboards that punish you.",
    body:
      "Productivity tools were built for output, not reflection. They guilt you for being human.",
  },
]

export function Problem() {
  return (
    <section className="container py-20 md:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
            You don{"\u2019"}t need more apps.
            <br />
            <span className="text-muted-foreground/80">
              You need a year that holds together.
            </span>
          </h2>
          <ul className="mt-10 divide-y divide-border/60 border-y border-border/60">
            {PROBLEMS.map((p, i) => (
              <li
                key={p.title}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-6"
              >
                <span className="font-display text-sm text-amber tabular-nums mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl md:text-2xl tracking-tight text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <ScatterOrbitVisual />
      </div>
    </section>
  )
}
