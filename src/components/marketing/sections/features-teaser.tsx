/* Hallmark · design-system: design.md · designed-as-app
 * Features — three cadence panels in a balanced row (not icon-tile grid).
 */

const CADENCES = [
  {
    name: "Yearly plan",
    body:
      "Wheel of Life, six areas, a few anchor projects, and the anti-goals you\u2019re protecting against.",
  },
  {
    name: "Weekly rhythm",
    body:
      "Three priorities, a five-minute check-in, and recap cards you\u2019d actually share.",
  },
  {
    name: "Daily systems",
    body: "Habits that quietly compound. One Today surface. No streak shame.",
  },
]

export function FeaturesTeaser() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1] text-foreground">
          One system. Three nested cadences.
        </h2>
        <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
          The year holds the week. The week holds the day. Each cadence
          carries the one beneath it, so plans don{"\u2019"}t fall through.
        </p>
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {CADENCES.map((c, i) => (
          <article
            key={c.name}
            className="relative rounded-2xl border border-border bg-card p-7 md:p-8 shadow-sm"
          >
            <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-amber/60" />
            <p className="font-display text-sm text-amber tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="font-display italic text-xl md:text-2xl tracking-tight text-foreground mt-3 leading-tight">
              {c.name}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed mt-4">
              {c.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
