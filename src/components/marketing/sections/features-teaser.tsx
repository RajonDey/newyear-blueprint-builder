import { CalendarDays, Layers, Repeat } from "lucide-react"

const FEATURES = [
  {
    icon: Layers,
    title: "Yearly plan",
    body: "Wheel of Life, 6 areas, a few anchor projects, and the anti-goals you're protecting against.",
  },
  {
    icon: CalendarDays,
    title: "Weekly rhythm",
    body: "Three priorities, a five-minute check-in, and recap cards you'd actually share.",
  },
  {
    icon: Repeat,
    title: "Daily systems",
    body: "Habits that quietly compound. One Today surface. No streak shame.",
  },
]

export function FeaturesTeaser() {
  return (
    <section className="container py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center mb-14">
        <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground mb-4">
          What you get
        </div>
        <h2 className="font-display text-3xl md:text-5xl tracking-tight leading-[1.1]">
          One system. Three nested cadences.
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-border bg-card p-7 flex flex-col"
          >
            <div className="h-10 w-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center mb-5">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl tracking-tight mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
