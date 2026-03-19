"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { ArrowLeft, ArrowRight, Target } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import type { LifeCategory } from "@prisma/client"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export function StepWheel() {
  const { wheelEntries, setWheelEntry, wheelContext, setWheelContext, nextStep, prevStep } =
    useWizardStore()

  const chartData = wheelEntries.map((entry) => ({
    category: CATEGORY_LABELS[entry.category] || entry.category,
    score: entry.rating,
    fullMark: 10,
  }))

  const avgScore = wheelEntries.reduce((sum, e) => sum + e.rating, 0) / wheelEntries.length

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Target className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">
          Your Wheel of Life
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Rate your current satisfaction in each area of life.
          Be honest — this is your starting point, not your destination.
        </p>
      </div>

      <OrnamentDivider variant="dot" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Sliders */}
        <div className="space-y-6">
          {wheelEntries.map((entry) => {
            const cat = LIFE_CATEGORIES.find((c) => c.id === entry.category)
            return (
              <div key={entry.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {cat && <cat.icon className="h-4 w-4" style={{ color: cat.color }} />}
                    <span className="text-sm font-medium">
                      {CATEGORY_LABELS[entry.category]}
                    </span>
                  </div>
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: cat?.color }}
                  >
                    {entry.rating}
                  </span>
                </div>
                <Slider
                  value={[entry.rating]}
                  onValueChange={([val]) =>
                    setWheelEntry(entry.category as LifeCategory, val)
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            )
          })}
        </div>

        {/* Radar Chart */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <Radar
                  name="Life Balance"
                  dataKey="score"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-muted-foreground">
            Average score: <span className="font-semibold text-foreground">{avgScore.toFixed(1)}</span> / 10
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-2">
        <h3 className="font-display text-lg font-medium">
          What does this reveal?
        </h3>
        <p className="text-sm text-muted-foreground">
          Looking at your wheel, what patterns do you notice?
          Which areas need the most attention?
        </p>
        <Textarea
          value={wheelContext}
          onChange={(e) => setWheelContext(e.target.value)}
          placeholder="I notice that my health and spirituality scores are lower than I'd like..."
          rows={3}
          className="resize-none bg-card"
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={nextStep}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
