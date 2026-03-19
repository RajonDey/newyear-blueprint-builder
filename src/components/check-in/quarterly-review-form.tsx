"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { EmptyState } from "@/components/shared/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import {
  CalendarRange,
  Loader2,
  Sparkles,
  Trophy,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"

const QUARTERS = [
  { value: "Q1" as const, label: "Q1", months: "Jan – Mar" },
  { value: "Q2" as const, label: "Q2", months: "Apr – Jun" },
  { value: "Q3" as const, label: "Q3", months: "Jul – Sep" },
  { value: "Q4" as const, label: "Q4", months: "Oct – Dec" },
]

interface FormData {
  plan: { id: string; year: number }
  goals: { id: string; title: string; category: string; status: string }[]
  wheelScores: Record<string, number>
  reviews: { quarter: string; summary: string | null; winsText: string | null; challengesText: string | null; adjustments: string | null }[]
}

export function QuarterlyReviewForm({ data }: { data: FormData }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [activeQuarter, setActiveQuarter] = useState("Q1")
  const [formState, setFormState] = useState<Record<string, { summary: string; wins: string; challenges: string; adjustments: string }>>(
    () => {
      const init: Record<string, { summary: string; wins: string; challenges: string; adjustments: string }> = {}
      for (const q of QUARTERS) {
        const r = data.reviews.find((x) => x.quarter === q.value)
        init[q.value] = {
          summary: r?.summary ?? "",
          wins: r?.winsText ?? "",
          challenges: r?.challengesText ?? "",
          adjustments: r?.adjustments ?? "",
        }
      }
      return init
    }
  )

  const wheelScoresArray = Object.entries(data.wheelScores).map(([category, rating]) => ({
    category,
    rating,
  }))

  async function handleSubmit(quarter: string) {
    const state = formState[quarter]
    if (!state) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/quarterly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          quarter,
          summary: state.summary.trim() || undefined,
          winsText: state.wins.trim() || undefined,
          challengesText: state.challenges.trim() || undefined,
          adjustments: state.adjustments.trim() || undefined,
          wheelOfLifeSnapshot: data.wheelScores,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success(`${quarter} review saved!`)
      router.refresh()
    } catch {
      toast.error("Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.goals.length === 0) {
    return (
      <div className="relative">
        <MandalaWatermark position="top-right" size="sm" />
        <EmptyState
          icon={CalendarRange}
          title="No plan yet"
          description="Create your yearly plan first. Quarterly reviews help you reflect and recalibrate every three months."
          action={
            <Button asChild>
              <a href="/plan/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create Your Plan
              </a>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative max-w-2xl space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Quarterly Review
        </h1>
        <p className="text-muted-foreground mt-1">
          Deep-dive into your quarter — wins, challenges, and adjustments for
          the next one.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <Tabs value={activeQuarter} onValueChange={setActiveQuarter}>
        <TabsList className="grid w-full grid-cols-4">
          {QUARTERS.map((q) => (
            <TabsTrigger key={q.value} value={q.value}>
              {q.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {QUARTERS.map((q) => {
          const state = formState[q.value]
          const existing = data.reviews.find((r) => r.quarter === q.value)
          return (
            <TabsContent key={q.value} value={q.value} className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <CalendarRange className="h-4 w-4 text-accent" />{" "}
                    {q.label} — {q.months}
                  </CardTitle>
                  {existing && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5" /> Review saved
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Summary</label>
                    <Textarea
                      value={state.summary}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [q.value]: { ...state, summary: e.target.value },
                        }))
                      }
                      placeholder="What happened this quarter? The big picture..."
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Trophy className="h-3.5 w-3.5 text-accent" /> Wins
                    </label>
                    <Textarea
                      value={state.wins}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [q.value]: { ...state, wins: e.target.value },
                        }))
                      }
                      placeholder="Celebrate your victories — big and small..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-accent" />{" "}
                      Challenges
                    </label>
                    <Textarea
                      value={state.challenges}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [q.value]: { ...state, challenges: e.target.value },
                        }))
                      }
                      placeholder="What was difficult? What got in the way?"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 text-accent" />{" "}
                      Adjustments
                    </label>
                    <Textarea
                      value={state.adjustments}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          [q.value]: { ...state, adjustments: e.target.value },
                        }))
                      }
                      placeholder="What will you do differently next quarter?"
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={() => handleSubmit(q.value)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trophy className="mr-2 h-4 w-4" />
                    )}
                    Save {q.label} Review
                  </Button>
                </CardContent>
              </Card>

              {wheelScoresArray.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-display">
                      Current Wheel of Life
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Snapshot included with your review
                    </p>
                  </CardHeader>
                  <CardContent>
                    <WheelChart scores={wheelScoresArray} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
