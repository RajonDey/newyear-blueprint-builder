"use client"

import { useEffect, useState } from "react"
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
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { EmptyState } from "@/components/shared/empty-state"
import { BarChart3, Loader2, Sparkles, TrendingUp, Target } from "lucide-react"

interface AnalyticsData {
  plan: { id: string; year: number }
  moodOverTime: { week: number; label: string; mood: number; date: Date }[]
  goalProgressOverTime: {
    goalId: string
    title: string
    categoryLabel: string
    data: { week: number; rating: number }[]
  }[]
  wheelScores: { category: string; rating: number }[]
  avgMood: number | null
  totalCheckIns: number
  completedGoals: number
  totalGoals: number
  quarterlyReviews: { quarter: string }[]
  currentWeek: number
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="relative">
        <MandalaWatermark position="top-right" size="sm" />
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Create your yearly plan and complete some check-ins to see your progress over time."
          action={
            <a
              href="/plan/new"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              <Sparkles className="h-4 w-4" /> Create your plan
            </a>
          }
        />
      </div>
    )
  }

  const hasMoodData = data.moodOverTime.length > 0
  const hasGoalData = data.goalProgressOverTime.some((g) => g.data.length > 0)

  return (
    <div className="relative space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Your {data.plan.year} progress at a glance — trends, patterns, and
          insights.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Check-ins</p>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <p className="text-3xl font-bold mt-1">{data.totalCheckIns}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Weekly reflections
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Goals Done</p>
              <Target className="h-4 w-4 text-accent" />
            </div>
            <p className="text-3xl font-bold mt-1">
              {data.completedGoals}/{data.totalGoals}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Completed this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Avg Mood</p>
            </div>
            <p className="text-3xl font-bold mt-1">
              {data.avgMood != null ? data.avgMood.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Across all check-ins
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Quarterly Reviews</p>
            </div>
            <p className="text-3xl font-bold mt-1">
              {data.quarterlyReviews.length}/4
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Q1–Q4 completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WheelChart scores={data.wheelScores} />

        {hasMoodData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">
                Mood Over Time
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your weekly overall mood (1–5)
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.moodOverTime}>
                    <defs>
                      <linearGradient
                        id="moodGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--accent))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--accent))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      domain={[1, 5]}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [value ?? 0, "Mood"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="mood"
                      stroke="hsl(var(--accent))"
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

      {hasGoalData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">
              Goal Progress Over Time
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Average progress rating per week (1–5)
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
                        point[`g_${g.goalId}`] = d?.rating ?? 0
                      }
                      return point
                    })
                  })()}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => {
                      const g = data.goalProgressOverTime.find(
                        (x) => `g_${x.goalId}` === name
                      )
                      return [value ?? 0, g?.title ?? String(name)]
                    }}
                  />
                  <Legend
                    formatter={(value) => {
                      const g = data.goalProgressOverTime.find(
                        (x) => `g_${x.goalId}` === value
                      )
                      return g?.title ?? value
                    }}
                  />
                  {data.goalProgressOverTime
                    .filter((g) => g.data.length > 0)
                    .map((g, i) => (
                      <Line
                        key={g.goalId}
                        type="monotone"
                        dataKey={`g_${g.goalId}`}
                        name={g.title}
                        stroke={
                          [
                            "hsl(var(--accent))",
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
    </div>
  )
}
