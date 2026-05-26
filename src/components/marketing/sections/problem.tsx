import { Sparkles, CalendarX, Gauge } from "lucide-react"

const PROBLEMS = [
  {
    icon: Sparkles,
    title: "January energy, gone by March",
    body: "You set thoughtful goals — then life scatters them across notes, tabs, and forgotten resolutions.",
  },
  {
    icon: CalendarX,
    title: "Plans that don't reach Tuesday",
    body: "Annual planning lives in one tool. Daily life lives in another. The two never meet.",
  },
  {
    icon: Gauge,
    title: "Dashboards that punish you",
    body: "Productivity tools were built for output, not reflection. They guilt you for being human.",
  },
]

export function Problem() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center mb-14">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
          The quiet problem
        </div>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
          You don&apos;t need more apps. You need a year that holds together.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {PROBLEMS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center mb-4">
              <p.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg tracking-tight mb-2">{p.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
