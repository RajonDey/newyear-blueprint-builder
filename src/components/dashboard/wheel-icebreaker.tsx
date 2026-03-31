"use client"

import { useState } from "react"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Target, Loader2, Play } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export function WheelIcebreaker({ userName }: { userName?: string | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [entries, setEntries] = useState<Record<LifeCategory, number>>({
    HEALTH: 5,
    CAREER: 5,
    FINANCE: 5,
    RELATIONSHIPS: 5,
    SPIRITUALITY: 5,
    PASSION: 5,
  })

  const handleSliderChange = (category: LifeCategory, value: number) => {
    setEntries((prev) => ({ ...prev, [category]: value }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const year = new Date().getFullYear()
      const payload = {
        year,
        wheelEntries: Object.entries(entries).map(([category, rating]) => ({
          category,
          rating,
        })),
      }

      const res = await fetch("/api/plans/icebreaker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error("Failed to save baseline")
      }

      toast.success("Baseline saved!")
      window.location.reload()
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      setIsSubmitting(false)
    }
  }

  const chartData = Object.entries(entries).map(([cat, rating]) => ({
    category: CATEGORY_LABELS[cat] || cat,
    score: rating,
    fullMark: 10,
  }))

  const avgScore =
    Object.values(entries).reduce((sum, val) => sum + val, 0) / 6

  return (
    <div className="max-w-5xl mx-auto space-y-8 bg-card border shadow-sm rounded-xl p-6 md:p-10 relative overflow-hidden mt-8">
      <div className="text-center space-y-3 relative z-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Target className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-4xl font-semibold mt-2">
          Welcome, {userName?.split(" ")[0] || "there"}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg mt-2">
          Before we plan your year, take 30 seconds to rate your current life satisfaction. Be honest — this is your starting baseline.
        </p>
      </div>

      <div className="py-2">
        <OrnamentDivider variant="dot" />
      </div>

      <div className="grid gap-12 lg:grid-cols-2 relative z-10">
        <div className="flex flex-col items-center gap-4 order-2 lg:order-1">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
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
          <p className="text-sm text-muted-foreground font-medium">
            Average score: <span className="font-semibold text-foreground text-base bg-secondary px-2 py-0.5 rounded ml-1">{avgScore.toFixed(1)}</span> / 10
          </p>
        </div>

        <div className="space-y-7 order-1 lg:order-2 flex flex-col justify-center">
          <div className="space-y-5">
            {LIFE_CATEGORIES.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <cat.icon className="h-4 w-4" style={{ color: cat.color }} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums" style={{ color: cat.color }}>
                    {entries[cat.id as LifeCategory]}
                  </span>
                </div>
                <Slider
                  value={[entries[cat.id as LifeCategory]]}
                  onValueChange={([val]) => handleSliderChange(cat.id as LifeCategory, val)}
                  min={1}
                  max={10}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
          
          <div className="pt-6">
            <Button size="lg" className="w-full text-base h-12" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Saving...</>
              ) : (
                <><Play className="mr-2 h-5 w-5"/> Save Baseline & Unlock Dashboard</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
