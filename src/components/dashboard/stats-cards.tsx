import { Card, CardContent } from "@/components/ui/card"
import { Target, Flame, CalendarCheck, Compass, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  goalStats: { total: number; completed: number; inProgress: number; atRisk: number }
  streak: { current: number; longest: number }
  systemsToday: { completed: number; total: number }
  currentQuarter: string
  trends?: {
    totalCheckIns: number
    lastMood: number | null
    prevMood: number | null
    moodDelta: number | null
  }
}

function TrendBadge({ value, label }: { value: number | null; label: string }) {
  if (value === null || value === 0) return null
  const isUp = value > 0
  const Icon = isUp ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium rounded-full px-1.5 py-0.5",
        isUp
          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30"
          : "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30"
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  )
}

export function StatsCards(props: StatsCardsProps) {
  const { goalStats, streak, systemsToday, currentQuarter, trends } = props

  const cards = [
    {
      key: "goals",
      label: "Active Goals",
      icon: Target,
      value: String(goalStats.total),
      sub: goalStats.completed > 0
        ? `${goalStats.completed} completed`
        : goalStats.atRisk > 0
          ? `${goalStats.atRisk} at risk`
          : "Get started",
      trend: goalStats.completed > 0
        ? { value: goalStats.completed, label: `${goalStats.completed} done` }
        : null,
    },
    {
      key: "streak",
      label: "Check-in Streak",
      icon: Flame,
      value: `${streak.current}w`,
      sub: `Longest: ${streak.longest}w`,
      trend: trends?.totalCheckIns
        ? { value: 1, label: `${trends.totalCheckIns} total` }
        : null,
    },
    {
      key: "systems",
      label: "Systems Today",
      icon: CalendarCheck,
      value: `${systemsToday.completed}/${systemsToday.total}`,
      sub:
        systemsToday.total === 0
          ? "No systems set"
          : systemsToday.completed === systemsToday.total
            ? "All done!"
            : `${systemsToday.total - systemsToday.completed} remaining`,
      trend: null,
    },
    {
      key: "mood",
      label: "Latest Mood",
      icon: Compass,
      value: trends?.lastMood ? `${trends.lastMood}/5` : "—",
      sub: currentQuarter + " · " + new Date().toLocaleDateString("en-US", { month: "short" }),
      trend: trends?.moodDelta
        ? { value: trends.moodDelta, label: trends.moodDelta > 0 ? "improving" : "dipped" }
        : null,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.label}
              </p>
              <card.icon className="h-4 w-4 text-accent" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-bold">{card.value}</p>
              {card.trend && <TrendBadge value={card.trend.value} label={card.trend.label} />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {card.sub}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
