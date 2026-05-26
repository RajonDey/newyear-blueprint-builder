import Link from "next/link"
import { ArrowRight } from "lucide-react"

type RecapCadence = "weekly" | "monthly" | "quarterly"

export function RhythmRecapLink({ cadence }: { cadence: RecapCadence }) {
  return (
    <Link
      href={`/recap/${cadence}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm hover:bg-accent/5 transition-colors"
    >
      <span className="text-muted-foreground">Shareable recap</span>
      <span className="flex items-center gap-1 font-medium capitalize">
        {cadence} card
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}
