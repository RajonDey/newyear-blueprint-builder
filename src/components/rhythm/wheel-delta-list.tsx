import { cn } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

interface WheelDeltaListProps {
  current: Record<string, number>
  previous: Record<string, number> | null
  className?: string
}

/** Per-category quarter-over-quarter wheel delta. */
export function WheelDeltaList({
  current,
  previous,
  className,
}: WheelDeltaListProps) {
  if (!previous || Object.keys(previous).length === 0) return null

  const categories = Object.keys(current).filter((c) => previous[c] != null)
  if (categories.length === 0) return null

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-2", className)}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        vs last quarter
      </p>
      <ul className="space-y-1.5">
        {categories.map((cat) => {
          const cur = current[cat] ?? 0
          const prev = previous[cat] ?? 0
          const delta = cur - prev
          const label = CATEGORY_LABELS[cat] ?? cat
          return (
            <li
              key={cat}
              className="flex items-center justify-between gap-2 text-sm"
            >
              <span className="text-muted-foreground truncate">{label}</span>
              <span className="flex items-center gap-2 shrink-0 tabular-nums">
                <span className="text-xs text-muted-foreground">
                  {prev} → {cur}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium min-w-[2.5rem] text-right",
                    delta > 0 && "text-emerald-600 dark:text-emerald-400",
                    delta < 0 && "text-red-600 dark:text-red-400",
                    delta === 0 && "text-muted-foreground",
                  )}
                >
                  {delta > 0 ? `+${delta}` : delta === 0 ? "—" : delta}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
