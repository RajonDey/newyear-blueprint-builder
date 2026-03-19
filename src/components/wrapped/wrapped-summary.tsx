"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { EmptyState } from "@/components/shared/empty-state"
import {
  Target,
  ClipboardCheck,
  Trophy,
  Flame,
  Sparkles,
  Loader2,
  Quote,
} from "lucide-react"

interface WrappedData {
  plan: { id: string; year: number; status: string }
  stats: {
    totalGoals: number
    completedGoals: number
    totalCheckIns: number
    avgMood: number | null
    longestStreak: number
    totalReviews: number
    totalAntiGoals: number
  }
  goals: { id: string; title: string; category: string; status: string }[]
  completedGoals: { id: string; title: string; category: string }[]
  wheelScores: { category: string; rating: number }[]
  achievements: { id: string; type: string; title: string; earnedAt: string; meta?: { icon: string; title: string; description: string } }[]
  reflections: Record<string, string> | null
  quarterlyReviews: { quarter: string }[]
}

export function WrappedSummary() {
  const [data, setData] = useState<WrappedData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/wrapped")
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
        <MandalaWatermark position="center" size="lg" />
        <EmptyState
          icon={Sparkles}
          title="No year to wrap yet"
          description="Create your yearly plan and live through the year. Your Year Wrapped will appear here with your progress, achievements, and reflections."
          action={
            <a
              href="/plan/new"
              className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
            >
              Create your plan →
            </a>
          }
        />
      </div>
    )
  }

  const { plan, stats, completedGoals, wheelScores, achievements } = data

  return (
    <div className="relative max-w-2xl mx-auto space-y-12 py-8">
      <MandalaWatermark position="top-right" size="lg" />

      <div className="text-center space-y-4">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
          Your {plan.year} in Review
        </h1>
        <p className="text-muted-foreground text-lg">
          A mindful look back at your journey
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.completedGoals}/{stats.totalGoals}</p>
                <p className="text-sm text-muted-foreground">Goals completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <ClipboardCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.totalCheckIns}</p>
                <p className="text-sm text-muted-foreground">Weekly check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Flame className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.longestStreak}w</p>
                <p className="text-sm text-muted-foreground">Longest streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Trophy className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.avgMood != null ? stats.avgMood.toFixed(1) : "—"}</p>
                <p className="text-sm text-muted-foreground">Avg mood</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {wheelScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display text-center">
              Your Wheel of Life
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WheelChart scores={wheelScores} />
          </CardContent>
        </Card>
      )}

      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" /> Goals You Crushed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {completedGoals.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <span className="text-accent">✓</span>
                  <span>{g.title}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" /> Achievements Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2"
                  title={a.meta?.description}
                >
                  <span className="text-2xl">{a.meta?.icon ?? "🏅"}</span>
                  <span className="font-medium">{a.meta?.title ?? a.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center py-8">
        <Quote className="h-12 w-12 mx-auto text-accent/50 mb-4" />
        <blockquote className="font-display text-xl italic text-muted-foreground max-w-md mx-auto">
          &ldquo;The journey of a thousand miles begins with a single step.&rdquo;
        </blockquote>
        <p className="text-sm text-muted-foreground mt-2">— Lao Tzu</p>
      </div>
    </div>
  )
}
