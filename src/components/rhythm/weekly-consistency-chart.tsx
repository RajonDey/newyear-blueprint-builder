"use client"

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { chartColors, axisDefaults, tooltipDefaults } from "@/lib/charts-theme"
import type { WeeklyConsistencyWeek } from "@/lib/queries/rhythm-stats"
import { TrendingUp } from "lucide-react"

interface WeeklyConsistencyChartProps {
  weeks: WeeklyConsistencyWeek[]
  consistencyPct: number
}

export function WeeklyConsistencyChart({
  weeks,
  consistencyPct,
}: WeeklyConsistencyChartProps) {
  const data = weeks.map((w) => ({
    label: w.label,
    value: w.reviewed ? 1 : 0,
    reviewed: w.reviewed,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-accent" />
            12-week consistency
          </span>
          <span className="font-display text-lg tabular-nums text-foreground">
            {consistencyPct}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tick={axisDefaults.tick}
                tickLine={false}
                axisLine={axisDefaults.axisLine}
                interval={1}
                fontSize={10}
              />
              <YAxis hide domain={[0, 1]} />
              <Tooltip
                {...tooltipDefaults}
                formatter={(value) =>
                  Number(value) === 1 ? "Reviewed" : "Missed"
                }
                labelFormatter={(label) => String(label)}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.reviewed ? chartColors.amber : chartColors.amberWash
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          {consistencyPct >= 75
            ? "Strong rhythm — keep closing each week."
            : consistencyPct >= 50
              ? "Building momentum — aim for one more review this month."
              : "Small streaks compound — even a short weekly review counts."}
        </p>
      </CardContent>
    </Card>
  )
}
