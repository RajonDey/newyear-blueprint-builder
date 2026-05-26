import {
  Target,
  Flame,
  CalendarCheck,
  Compass,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  projectStats: {
    total: number
    completed: number
    inProgress: number
    atRisk: number
    active: number
  }
  streak: { current: number; longest: number }
  systemsToday: { completed: number; total: number }
  currentQuarter: string
  trends?: {
    totalCheckIns: number
    lastMood: number | null
    prevMood: number | null
    moodDelta: number | null
  }
  weeklyPriorityCount?: number
}

function TrendChip({
  value,
  label,
}: {
  value: number | null
  label: string
}) {
  if (value === null || value === 0) return null
  const isUp = value > 0
  const Icon = isUp ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
        isUp
          ? "text-emerald-700 bg-emerald-100/70 dark:text-emerald-400 dark:bg-emerald-900/30"
          : "text-amber-700 bg-amber-100/70 dark:text-amber-400 dark:bg-amber-900/30",
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

interface StatCard {
  key: string
  label: string
  icon: LucideIcon
  value: React.ReactNode
  sub: string
  trend: { value: number; label: string } | null
}

export function StatsCards({
  projectStats,
  streak,
  systemsToday,
  currentQuarter,
  trends,
  weeklyPriorityCount = 0,
}: StatsCardsProps) {
  const activeSub =
    weeklyPriorityCount > 0 && projectStats.active > 0
      ? `${projectStats.active} active · ${weeklyPriorityCount} prioritized this week`
      : weeklyPriorityCount > 0
        ? `${weeklyPriorityCount} prioritized this week`
        : projectStats.completed > 0
          ? `${projectStats.completed} completed`
          : projectStats.atRisk > 0
            ? `${projectStats.atRisk} at risk`
            : "Get started"

  const cards: StatCard[] = [
    {
      key: "projects",
      label: "Active projects",
      icon: Target,
      value: projectStats.total,
      sub: activeSub,
      trend:
        projectStats.completed > 0
          ? { value: projectStats.completed, label: `${projectStats.completed} done` }
          : null,
    },
    {
      key: "streak",
      label: "Check-in streak",
      icon: Flame,
      value: `${streak.current}w`,
      sub: `Longest: ${streak.longest}w`,
      trend: trends?.totalCheckIns
        ? { value: 1, label: `${trends.totalCheckIns} total` }
        : null,
    },
    {
      key: "systems",
      label: "Systems today",
      icon: CalendarCheck,
      value: `${systemsToday.completed}/${systemsToday.total}`,
      sub:
        systemsToday.total === 0
          ? "No systems set"
          : systemsToday.completed === systemsToday.total
            ? "All done"
            : `${systemsToday.total - systemsToday.completed} remaining`,
      trend: null,
    },
    {
      key: "mood",
      label: "Latest mood",
      icon: Compass,
      value: trends?.lastMood ? `${trends.lastMood}/5` : "—",
      sub: `${currentQuarter} · ${new Date().toLocaleDateString("en-US", {
        month: "short",
      })}`,
      trend: trends?.moodDelta
        ? {
            value: trends.moodDelta,
            label: trends.moodDelta > 0 ? "improving" : "dipped",
          }
        : null,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <article
          key={c.key}
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-amber/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              {c.label}
            </span>
            <c.icon
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden
            />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold tabular-nums leading-none">
              {c.value}
            </span>
            {c.trend && <TrendChip value={c.trend.value} label={c.trend.label} />}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{c.sub}</p>
        </article>
      ))}
    </div>
  )
}
