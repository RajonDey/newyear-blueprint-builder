import { Flame, CalendarCheck, CalendarDays } from "lucide-react"
import type { RhythmStats } from "@/lib/queries/rhythm-stats"
import { cn } from "@/lib/utils"

export function RhythmStatsStrip({ stats }: { stats: RhythmStats }) {
  const items = [
    {
      icon: Flame,
      label: "Week streak",
      value: stats.weeklyStreak > 0 ? `${stats.weeklyStreak}w` : "—",
      highlight: stats.weeklyStreak >= 2,
    },
    {
      icon: CalendarCheck,
      label: "12-wk consistency",
      value: `${stats.weekConsistencyPct}%`,
      highlight: stats.weekConsistencyPct >= 75,
    },
    {
      icon: CalendarDays,
      label: "Months reviewed",
      value: `${stats.monthsReviewed}/12`,
      highlight: stats.monthsReviewed >= 6,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-xl border px-3 py-2.5 text-center",
            item.highlight
              ? "border-accent/30 bg-accent/5"
              : "border-border bg-card/60",
          )}
        >
          <item.icon
            className={cn(
              "h-3.5 w-3.5 mx-auto mb-1",
              item.highlight ? "text-accent" : "text-muted-foreground",
            )}
          />
          <p className="font-display text-lg tabular-nums leading-none">
            {item.value}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 leading-tight">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  )
}
