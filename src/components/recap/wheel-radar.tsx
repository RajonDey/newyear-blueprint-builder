"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Quarterly recap wheel — chart theme tokens (Wave G).
 */

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { ChartContainer } from "@/components/charts/chart-container"
import type { LifeCategory } from "@prisma/client"
import { chartColors, axisDefaults, gridDefaults } from "@/lib/charts-theme"

const LABELS: Record<LifeCategory, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

const ALL: LifeCategory[] = [
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
]

export function WheelRadar({
  entries,
}: {
  entries: { category: LifeCategory; rating: number }[]
}) {
  const data = ALL.map((c) => ({
    category: LABELS[c],
    Now: entries.find((e) => e.category === c)?.rating ?? 0,
  }))
  return (
    <ChartContainer height={224}>
      <RadarChart data={data} outerRadius="80%">
          <PolarGrid {...gridDefaults} />
          <PolarAngleAxis dataKey="category" tick={axisDefaults.tick} />
          <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            dataKey="Now"
            stroke={chartColors.amber}
            fill={chartColors.amber}
            fillOpacity={0.25}
            strokeWidth={2}
          />
      </RadarChart>
    </ChartContainer>
  )
}
