"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import {
  CalendarDays,
  Loader2,
  Sparkles,
  Trophy,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MONTHS = [
  { value: 1, label: "Jan", full: "January" },
  { value: 2, label: "Feb", full: "February" },
  { value: 3, label: "Mar", full: "March" },
  { value: 4, label: "Apr", full: "April" },
  { value: 5, label: "May", full: "May" },
  { value: 6, label: "Jun", full: "June" },
  { value: 7, label: "Jul", full: "July" },
  { value: 8, label: "Aug", full: "August" },
  { value: 9, label: "Sep", full: "September" },
  { value: 10, label: "Oct", full: "October" },
  { value: 11, label: "Nov", full: "November" },
  { value: 12, label: "Dec", full: "December" },
]

interface FormData {
  plan: { id: string; year: number }
  goals: { id: string; title: string; category: string; status: string }[]
  reviews: { month: number; year: number; summary: string | null; winsText: string | null; challengesText: string | null; adjustments: string | null; completedAt: Date | string }[]
}

export function MonthlyReviewForm({ data }: { data: FormData }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const currentJsMonth = new Date().getMonth() + 1
  const [activeMonth, setActiveMonth] = useState(currentJsMonth)

  const reviewedMonths = new Set(data.reviews.map((r) => r.month))

  const [formState, setFormState] = useState<Record<number, { summary: string; wins: string; challenges: string; adjustments: string }>>(
    () => {
      const init: Record<number, { summary: string; wins: string; challenges: string; adjustments: string }> = {}
      for (const m of MONTHS) {
        const r = data.reviews.find((x) => x.month === m.value)
        init[m.value] = {
          summary: r?.summary ?? "",
          wins: r?.winsText ?? "",
          challenges: r?.challengesText ?? "",
          adjustments: r?.adjustments ?? "",
        }
      }
      return init
    }
  )

  async function handleSubmit(month: number) {
    const state = formState[month]
    if (!state) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          month,
          year: data.plan.year,
          summary: state.summary.trim() || undefined,
          winsText: state.wins.trim() || undefined,
          challengesText: state.challenges.trim() || undefined,
          adjustments: state.adjustments.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      const monthLabel = MONTHS.find((m) => m.value === month)?.full ?? `Month ${month}`
      toast.success(`${monthLabel} review saved!`)
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
          <h1 className="font-display text-2xl font-semibold">Monthly Review</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Once a month, step back and look at the bigger picture.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 max-w-md mx-auto">
          {[
            { label: "Wins", desc: "Celebrate what went well" },
            { label: "Challenges", desc: "Name what held you back" },
            { label: "Adjustments", desc: "Decide what to change" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-dashed p-3 text-center">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <EmptyState
          icon={CalendarDays}
          title="Monthly reviews live here"
          description="Create goals first, then come back each month to reflect on what worked, what didn't, and what to adjust."
          action={
            <Button asChild>
              <a href="/plan/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
              </a>
            </Button>
          }
        />
      </div>
    )
  }

  const activeMonthData = MONTHS.find((m) => m.value === activeMonth)!
  const state = formState[activeMonth]
  const existing = data.reviews.find((r) => r.month === activeMonth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Monthly Review</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {reviewedMonths.size} of 12 months reviewed
          </p>
        </div>
      </div>

      {/* Month grid selector */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
        {MONTHS.map((m) => {
          const isActive = m.value === activeMonth
          const isReviewed = reviewedMonths.has(m.value)
          const isCurrent = m.value === currentJsMonth
          return (
            <button
              key={m.value}
              onClick={() => setActiveMonth(m.value)}
              className={cn(
                "relative rounded-lg border px-2 py-2.5 text-center text-sm font-medium transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "hover:bg-muted/50",
                isCurrent && !isActive && "border-accent/30"
              )}
            >
              {m.label}
              {isReviewed && (
                <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-emerald-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Active month form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            {activeMonthData.full} {data.plan.year}
          </CardTitle>
          {existing && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Reviewed on {new Date(existing.completedAt).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monthly Summary</label>
            <RichTextEditor
              value={state.summary}
              onChange={(val) =>
                setFormState((prev) => ({
                  ...prev,
                  [activeMonth]: { ...state, summary: val },
                }))
              }
              placeholder="What was the dominant theme of this month?"
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
                  [activeMonth]: { ...state, wins: val },
                }))
              }
              placeholder="Celebrate the best executions of the last 4 weeks..."
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
                  [activeMonth]: { ...state, challenges: val },
                }))
              }
              placeholder="What friction consistently showed up?"
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
                  [activeMonth]: { ...state, adjustments: val },
                }))
              }
              placeholder="How will you adjust heading into the next month?"
              rows={3}
              className="bg-card"
            />
          </div>
          <Button
            onClick={() => handleSubmit(activeMonth)}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            Save {activeMonthData.full} review
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
