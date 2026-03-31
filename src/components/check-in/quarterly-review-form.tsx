"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import {
  Activity,
  Loader2,
  Sparkles,
  Trophy,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const QUARTERS = [
  { value: "Q1" as const, label: "Q1", months: "Jan – Mar" },
  { value: "Q2" as const, label: "Q2", months: "Apr – Jun" },
  { value: "Q3" as const, label: "Q3", months: "Jul – Sep" },
  { value: "Q4" as const, label: "Q4", months: "Oct – Dec" },
]

function getCurrentQuarter(): string {
  const m = new Date().getMonth()
  if (m < 3) return "Q1"
  if (m < 6) return "Q2"
  if (m < 9) return "Q3"
  return "Q4"
}

interface FormData {
  plan: { id: string; year: number }
  goals: { id: string; title: string; category: string; status: string }[]
  wheelScores: Record<string, number>
  reviews: { quarter: string; summary: string | null; winsText: string | null; challengesText: string | null; adjustments: string | null }[]
}

export function QuarterlyReviewForm({ data }: { data: FormData }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [activeQuarter, setActiveQuarter] = useState(getCurrentQuarter)

  const reviewedQuarters = new Set(data.reviews.map((r) => r.quarter))

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
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Quarterly Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Every 3 months, zoom out and recalibrate your goals.
          </p>
        </div>
        <EmptyState
          icon={Activity}
          title="Add goals to start quarterly reviews"
          description="Quarterly reviews help you reflect on goal health and adjust your plan. Create goals first."
          action={
            <Button asChild>
              <a href="/goals">
                <Sparkles className="mr-2 h-4 w-4" /> Go to goals
              </a>
            </Button>
          }
        />
      </div>
    )
  }

  const currentQ = getCurrentQuarter()
  const activeQ = QUARTERS.find((q) => q.value === activeQuarter)!
  const state = formState[activeQuarter]
  const existing = data.reviews.find((r) => r.quarter === activeQuarter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Quarterly Review</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {reviewedQuarters.size} of 4 quarters reviewed
          </p>
        </div>
      </div>

      {/* Quarter selector — mirrors monthly grid pattern */}
      <div className="grid grid-cols-4 gap-1.5">
        {QUARTERS.map((q) => {
          const isActive = q.value === activeQuarter
          const isReviewed = reviewedQuarters.has(q.value)
          const isCurrent = q.value === currentQ
          return (
            <button
              key={q.value}
              onClick={() => setActiveQuarter(q.value)}
              className={cn(
                "relative rounded-lg border px-2 py-3 text-center transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "hover:bg-muted/50",
                isCurrent && !isActive && "border-accent/30"
              )}
            >
              <span className="text-sm font-medium">{q.label}</span>
              <span className="block text-xs text-muted-foreground">{q.months}</span>
              {isReviewed && (
                <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Goal health snapshot */}
      {data.goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {data.goals.map((g) => {
            const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
            const statusColor =
              g.status === "COMPLETED" ? "text-emerald-600 dark:text-emerald-400" :
              g.status === "AT_RISK" ? "text-red-600 dark:text-red-400" :
              "text-muted-foreground"
            return (
              <div
                key={g.id}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              >
                {cat && <cat.icon className="h-3 w-3" style={{ color: cat.color }} />}
                <span className="font-medium">{g.title}</span>
                <span className={cn("capitalize", statusColor)}>
                  {g.status.toLowerCase().replace("_", " ")}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Active quarter form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            {activeQ.label} — {activeQ.months}
          </CardTitle>
          {existing && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Review saved
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Summary</label>
            <RichTextEditor
              value={state.summary}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  [activeQuarter]: { ...state, summary: val },
                }))
              }
              placeholder="What happened this quarter? The big picture..."
              rows={2}
              className="bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-accent" /> Wins
            </label>
            <RichTextEditor
              value={state.wins}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  [activeQuarter]: { ...state, wins: val },
                }))
              }
              placeholder="Celebrate your victories — big and small..."
              rows={3}
              className="bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-accent" /> Challenges
            </label>
            <RichTextEditor
              value={state.challenges}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  [activeQuarter]: { ...state, challenges: val },
                }))
              }
              placeholder="What was difficult? What got in the way?"
              rows={3}
              className="bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-accent" /> Adjustments
            </label>
            <RichTextEditor
              value={state.adjustments}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  [activeQuarter]: { ...state, adjustments: val },
                }))
              }
              placeholder="What will you do differently next quarter?"
              rows={3}
              className="bg-card"
            />
          </div>
          <Button
            onClick={() => handleSubmit(activeQuarter)}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            Save {activeQ.label} review
          </Button>
        </CardContent>
      </Card>

      {/* Wheel of Life snapshot */}
      {wheelScoresArray.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Wheel of Life — included with your review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WheelChart scores={wheelScoresArray} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
