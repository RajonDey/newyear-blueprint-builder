const STEPS = [
  {
    n: "01",
    word: "Reflect",
    body: "Sit with the year as it is — wins, drift, and the quiet moments you almost forgot.",
  },
  {
    n: "02",
    word: "Plan",
    body: "Translate clarity into a small set of goals, anti-goals, and a Wheel of Life that holds.",
  },
  {
    n: "03",
    word: "Live",
    body: "A weekly rhythm and a daily Today surface — small, repeatable, kept.",
  },
  {
    n: "04",
    word: "Review",
    body: "Recap cards each week, month, quarter — and a year-end Wrapped worth keeping.",
  },
]

export function Plan() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center mb-14">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
          The plan
        </div>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
          One loop. Four moves. The whole year.
        </h2>
      </div>
      <div className="grid gap-10 md:grid-cols-2 max-w-3xl mx-auto">
        {STEPS.map((s) => (
          <div key={s.word} className="relative pl-8">
            <span className="absolute left-0 top-1 font-display text-xs text-amber tabular-nums">
              {s.n}
            </span>
            <h3 className="font-display text-2xl md:text-3xl tracking-tight">{s.word}</h3>
            <p className="text-muted-foreground mt-2 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
