/* Hallmark · design-system: design.md · designed-as-app
 * Dashboard stat strip — T4 numbered stat strip (§6, Wave C).
 */

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

type StatItem = {
  key: string
  value: string
  qualifier: string
  meta?: string
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
      ? `${projectStats.active} active · ${weeklyPriorityCount} this week`
      : weeklyPriorityCount > 0
        ? `${weeklyPriorityCount} prioritized this week`
        : projectStats.completed > 0
          ? `${projectStats.completed} completed`
          : projectStats.atRisk > 0
            ? `${projectStats.atRisk} at risk`
            : "Get started"

  const monthLabel = new Date().toLocaleDateString("en-US", { month: "short" })

  const stats: StatItem[] = [
    {
      key: "projects",
      value: String(projectStats.total),
      qualifier: "Active projects",
      meta: activeSub,
    },
    {
      key: "streak",
      value: `${streak.current}w`,
      qualifier: "Check-in streak",
      meta:
        trends?.totalCheckIns && trends.totalCheckIns > 0
          ? `Longest ${streak.longest}w · ${trends.totalCheckIns} total`
          : `Longest ${streak.longest}w`,
    },
    {
      key: "systems",
      value:
        systemsToday.total === 0
          ? "—"
          : `${systemsToday.completed}/${systemsToday.total}`,
      qualifier: "Systems today",
      meta:
        systemsToday.total === 0
          ? "No systems set"
          : systemsToday.completed === systemsToday.total
            ? "All done"
            : `${systemsToday.total - systemsToday.completed} remaining`,
    },
    {
      key: "mood",
      value: trends?.lastMood ? `${trends.lastMood}/5` : "—",
      qualifier: "Latest mood",
      meta: `${currentQuarter} · ${monthLabel}${
        trends?.moodDelta
          ? trends.moodDelta > 0
            ? " · improving"
            : " · dipped"
          : ""
      }`,
    },
  ]

  return (
    <section
      aria-label="Year at a glance"
      className="border-y border-border py-4 sm:py-5"
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:divide-x sm:divide-border sm:gap-0">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="min-w-0 sm:flex-1 sm:px-6 first:sm:pl-0 last:sm:pr-0"
          >
            <p className="font-display text-2xl sm:text-3xl tabular-nums leading-none tracking-tight">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs font-medium text-foreground">
              {stat.qualifier}
            </p>
            {stat.meta && (
              <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                {stat.meta}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
