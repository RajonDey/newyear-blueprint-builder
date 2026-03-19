"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Wheel of Life</CardTitle>
          <span className="text-sm text-muted-foreground">
            Avg: <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} />
              <Radar
                dataKey="score"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
