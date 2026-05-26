"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { chartColors, axisDefaults, gridDefaults } from "@/lib/charts-theme"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

interface WheelChartProps {
  scores: { category: string; rating: number }[]
}

export function WheelChart({ scores }: WheelChartProps) {
  if (scores.length === 0) return null

  const data = scores.map((s) => ({
    category: CATEGORY_LABELS[s.category] || s.category,
    score: s.rating,
    fullMark: 10,
  }))

  const avg = scores.reduce((sum, s) => sum + s.rating, 0) / scores.length

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl md:text-2xl tracking-tight">
            Wheel of life
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            The shape of your year
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl tabular-nums leading-none">
            {avg.toFixed(1)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Average</div>
        </div>
      </header>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="78%">
            <PolarGrid {...gridDefaults} />
            <PolarAngleAxis
              dataKey="category"
              tick={axisDefaults.tick}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Radar
              dataKey="score"
              stroke={chartColors.amber}
              fill={chartColors.amber}
              fillOpacity={0.22}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
