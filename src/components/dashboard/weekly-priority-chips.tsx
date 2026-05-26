import Link from "next/link"
import { ArrowRight, Target } from "lucide-react"
import type { WeeklyPriorityProject } from "@/lib/queries/weekly-priorities"

const MAX_CHIPS = 3

export function WeeklyPriorityChips({
  projects,
  weekNumber,
}: {
  projects: WeeklyPriorityProject[]
  weekNumber: number
}) {
  if (projects.length === 0) return null

  const visible = projects.slice(0, MAX_CHIPS)
  const hidden = projects.length - visible.length

  return (
    <div className="border-b border-border/70 px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
          <Target className="h-3 w-3 text-amber" />
          Week {weekNumber} priorities
        </span>
        {visible.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="inline-flex max-w-full items-center rounded-full border border-amber/35 bg-amber/[0.06] px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-amber/10"
          >
            <span className="truncate">{p.title}</span>
          </Link>
        ))}
        {hidden > 0 && (
          <span className="text-[11px] text-muted-foreground">+{hidden} more</span>
        )}
        <Link
          href="/rhythm/weekly?tab=plan"
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Edit plan
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  )
}
