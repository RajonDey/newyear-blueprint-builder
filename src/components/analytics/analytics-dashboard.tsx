"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Analytics dashboard — editorial stat strip, flat chart panels (Wave D4).
 */

import Link from "next/link"
import type { AnalyticsData } from "@/lib/queries/analytics"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { EmptyState } from "@/components/shared/empty-state"
import { WeeklyConsistencyChart } from "@/components/rhythm/weekly-consistency-chart"
import {
  BarChart3,
  CalendarCheck,
  Sparkles,
} from "lucide-react"
import {
  chartColors,
  chartSeries,
  axisDefaults,
  gridDefaults,
  tooltipDefaults,
} from "@/lib/charts-theme"
import { DAILY_STATE_CHART_MIN_DAYS } from "@/lib/analytics/daily-state-trend"
import { cn } from "@/lib/utils"

export function AnalyticsDashboard({
  initialData,
}: {
  initialData: AnalyticsData | null
}) {
  const data = initialData

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics yet"
        description="Start with a yearly plan, then complete weekly reviews and log mood on Today — patterns will appear here."
        action={
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 text-amber hover:underline font-medium"
          >
            <Sparkles className="h-4 w-4" /> Create your plan
          </Link>
        }
      />
    )
  }

  const hasMoodData = data.moodOverTime.length > 0
  const hasGoalData = data.goalProgressOverTime.some((g) => g.data.length > 0)
  const hasRhythmChart = (data.rhythmStats?.weeklyConsistency.length ?? 0) > 0

  const stats = [
    {
      key: "streak",
      value: `${data.streak.current}w`,
      qualifier: "Check-in streak",
      meta: `Longest ${data.streak.longest}w`,
    },
    {
      key: "reviews",
      value: String(data.totalCheckIns),
      qualifier: "Weekly reviews",
      meta: "Saved this year",
    },
    {
      key: "systems-today",
      value:
        data.systemsToday.total > 0
          ? `${data.systemsToday.completed}/${data.systemsToday.total}`
          : "—",
      qualifier: "Systems today",
      meta:
        data.systemsToday.total > 0
          ? "Active habits checked off"
          : "No active systems",
    },
    {
      key: "systems-consistency",
      value:
        data.systemsConsistencyPct != null
          ? `${data.systemsConsistencyPct}%`
          : "—",
      qualifier: "Systems consistency",
      meta:
        data.activeSystemCount > 0
          ? `${data.activeSystemCount} active · 7-day avg`
          : "Add systems to projects",
    },
    {
      key: "projects",
      value: `${data.completedGoals}/${data.totalGoals}`,
      qualifier: "Projects done",
      meta: "Completed this year",
    },
    {
      key: "mood",
      value: data.avgMood != null ? data.avgMood.toFixed(1) : "—",
      qualifier: "Avg weekly mood",
      meta: "From weekly reviews",
    },
  ]

  return (
    <div className="space-y-8">
      {!data.hasAnyTrendData && (
        <div className="border border-amber/40 bg-amber-tint p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg tracking-tight">
                Your charts are waiting on rhythm data
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Complete a weekly review and log mood or energy on Today for a few
                days — analytics needs at least one review or{" "}
                {DAILY_STATE_CHART_MIN_DAYS} daily check-ins to draw a trend.
              </p>
            </div>
            <Link
              href="/rhythm/weekly?tab=review"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <CalendarCheck className="h-4 w-4" />
              Complete your weekly review
            </Link>
          </div>
        </div>
      )}

      <section
        aria-label="Year at a glance"
        className="border border-border"
      >
        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.key} className="min-w-0 p-4 sm:p-5">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />

        {data.showDailyStateChart ? (
          <ChartPanel
            title="Daily mood & energy"
            description="From Today check-ins over the last 30 days (1–5)"
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyStateTrend}>
                  <CartesianGrid {...gridDefaults} />
                  <XAxis
                    dataKey="label"
                    tick={axisDefaults.tick}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[1, 5]} tick={axisDefaults.tick} />
                  <Tooltip
                    {...tooltipDefaults}
                    formatter={(value, name) => [
                      value ?? "—",
                      name === "mood" ? "Mood" : "Energy",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood"
                    stroke={chartColors.amber}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    name="Energy"
                    stroke={chartColors.inkSoft}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>
        ) : (
          <ChartPanel
            title="Daily mood & energy"
            description={
              data.dailyStateTrendDays > 0
                ? `${data.dailyStateTrendDays} of ${DAILY_STATE_CHART_MIN_DAYS} days logged — keep checking in on Today.`
                : "Log mood or energy on the dashboard Today card to start this trend."
            }
            dashed
          >
            <Link
              href="/dashboard#today"
              className="inline-flex items-center gap-2 text-sm text-amber hover:underline"
            >
              Open Today →
            </Link>
          </ChartPanel>
        )}

        {hasMoodData && (
          <ChartPanel
            title="Weekly mood"
            description="Overall mood from weekly reviews (1–5)"
          >
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.moodOverTime}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...gridDefaults} />
                  <XAxis dataKey="label" tick={axisDefaults.tick} />
                  <YAxis domain={[1, 5]} tick={axisDefaults.tick} />
                  <Tooltip
                    {...tooltipDefaults}
                    formatter={(value) => [value ?? 0, "Mood"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke={chartColors.amber}
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartPanel>
        )}
      </div>

      {hasRhythmChart && data.rhythmStats && (
        <WeeklyConsistencyChart
          weeks={data.rhythmStats.weeklyConsistency}
          consistencyPct={data.rhythmStats.weekConsistencyPct}
        />
      )}

      {hasGoalData && (
        <ChartPanel
          title="Project progress over time"
          description="Progress rating per week from your reviews (1–5)"
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(() => {
                  const weeks = new Set<number>()
                  for (const g of data.goalProgressOverTime) {
                    for (const d of g.data) weeks.add(d.week)
                  }
                  const sortedWeeks = [...weeks].sort((a, b) => a - b)
                  return sortedWeeks.map((w) => {
                    const point: Record<string, string | number> = {
                      week: w,
                      label: `W${w}`,
                    }
                    for (const g of data.goalProgressOverTime) {
                      const d = g.data.find((x) => x.week === w)
                      point[`g_${g.projectId}`] = d?.rating ?? 0
                    }
                    return point
                  })
                })()}
              >
                <CartesianGrid {...gridDefaults} />
                <XAxis dataKey="label" tick={axisDefaults.tick} />
                <YAxis domain={[0, 5]} tick={axisDefaults.tick} />
                <Tooltip
                  {...tooltipDefaults}
                  formatter={(value, name) => {
                    const g = data.goalProgressOverTime.find(
                      (x) => `g_${x.projectId}` === name,
                    )
                    return [value ?? 0, g?.title ?? String(name)]
                  }}
                />
                <Legend
                  formatter={(value) => {
                    const g = data.goalProgressOverTime.find(
                      (x) => `g_${x.projectId}` === value,
                    )
                    return g?.title ?? value
                  }}
                />
                {data.goalProgressOverTime
                  .filter((g) => g.data.length > 0)
                  .map((g, i) => (
                    <Line
                      key={g.projectId}
                      type="monotone"
                      dataKey={`g_${g.projectId}`}
                      name={g.title}
                      stroke={chartSeries[i % chartSeries.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartPanel>
      )}

      {!hasGoalData && data.hasAnyTrendData && (
        <p className="border border-border px-4 py-3 text-sm text-muted-foreground">
          Project rating lines appear after you rate projects in a{" "}
          <Link
            href="/rhythm/weekly?tab=review"
            className="text-foreground hover:text-amber transition-colors"
          >
            weekly review
          </Link>
          .
        </p>
      )}
    </div>
  )
}

function ChartPanel({
  title,
  description,
  children,
  dashed,
}: {
  title: string
  description?: string
  children: React.ReactNode
  dashed?: boolean
}) {
  return (
    <section
      className={cn("border border-border", dashed && "border-dashed")}
    >
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        ) : null}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  )
}
