"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { EmptyState } from "@/components/shared/empty-state"
import { WeeklyConsistencyChart } from "@/components/rhythm/weekly-consistency-chart"
import {
  BarChart3,
  CalendarCheck,
  Flame,
  Repeat,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"
import { chartColors, axisDefaults, gridDefaults, tooltipDefaults } from "@/lib/charts-theme"
import { DAILY_STATE_CHART_MIN_DAYS } from "@/lib/analytics/daily-state-trend"

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Your {data.plan.year} progress at a glance — daily signals, weekly rhythm,
          and the patterns that compound quietly.
        </p>
      </div>

      {!data.hasAnyTrendData && (
        <div className="rounded-2xl border border-dashed border-amber/40 bg-amber/[0.04] p-6">
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

      <OrnamentDivider variant="lotus" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Check-in streak"
          value={`${data.streak.current}w`}
          sub={`Longest ${data.streak.longest}w`}
          icon={Flame}
        />
        <StatCard
          label="Weekly reviews"
          value={String(data.totalCheckIns)}
          sub="Saved this year"
          icon={TrendingUp}
        />
        <StatCard
          label="Systems today"
          value={
            data.systemsToday.total > 0
              ? `${data.systemsToday.completed}/${data.systemsToday.total}`
              : "—"
          }
          sub={
            data.systemsToday.total > 0
              ? "Active habits checked off"
              : "No active systems"
          }
          icon={Repeat}
        />
        <StatCard
          label="Systems consistency"
          value={
            data.systemsConsistencyPct != null
              ? `${data.systemsConsistencyPct}%`
              : "—"
          }
          sub={
            data.activeSystemCount > 0
              ? `${data.activeSystemCount} active · 7-day avg`
              : "Add systems to projects"
          }
          icon={Repeat}
        />
        <StatCard
          label="Projects done"
          value={`${data.completedGoals}/${data.totalGoals}`}
          sub="Completed this year"
          icon={Target}
        />
        <StatCard
          label="Avg weekly mood"
          value={data.avgMood != null ? data.avgMood.toFixed(1) : "—"}
          sub="From weekly reviews"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />

        {data.showDailyStateChart ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">
                Daily mood & energy
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                From Today check-ins over the last 30 days (1–5)
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg font-display">Daily mood & energy</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.dailyStateTrendDays > 0
                  ? `${data.dailyStateTrendDays} of ${DAILY_STATE_CHART_MIN_DAYS} days logged — keep checking in on Today.`
                  : "Log mood or energy on the dashboard Today card to start this trend."}
              </p>
            </CardHeader>
            <CardContent>
              <Link
                href="/dashboard#today"
                className="inline-flex items-center gap-2 text-sm text-amber hover:underline"
              >
                Open Today →
              </Link>
            </CardContent>
          </Card>
        )}

        {hasMoodData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Weekly mood</CardTitle>
              <p className="text-sm text-muted-foreground">
                Overall mood from weekly reviews (1–5)
              </p>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>

      {hasRhythmChart && data.rhythmStats && (
        <WeeklyConsistencyChart
          weeks={data.rhythmStats.weeklyConsistency}
          consistencyPct={data.rhythmStats.weekConsistencyPct}
        />
      )}

      {hasGoalData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">
              Project progress over time
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Progress rating per week from your reviews (1–5)
            </p>
          </CardHeader>
          <CardContent>
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
                        stroke={
                          [
                            chartColors.amber,
                            "hsl(217 91% 60%)",
                            "hsl(142 71% 45%)",
                            "hsl(340 82% 52%)",
                          ][i % 4]
                        }
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        connectNulls
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasGoalData && data.hasAnyTrendData && (
        <div className="rounded-xl border border-border/70 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          Project rating lines appear after you rate projects in a{" "}
          <Link
            href="/rhythm/weekly?tab=review"
            className="text-foreground hover:text-amber transition-colors"
          >
            weekly review
          </Link>
          .
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub: string
  icon: typeof TrendingUp
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="h-4 w-4 text-accent" />
        </div>
        <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}
