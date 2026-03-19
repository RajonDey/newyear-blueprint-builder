"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { ClipboardCheck, Loader2, Sparkles, Smile } from "lucide-react"
import { toast } from "sonner"

interface Goal {
  id: string
  title: string
  category: string
}

interface FormData {
  plan: { id: string; year: number }
  goals: Goal[]
  weekNumber: number
  year: number
  existingCheckIn: {
    id: string
    overallMood: number | null
    notes: string | null
    goalCheckIns: { goalId: string; progressRating: number; notes: string | null; blockers: string | null }[]
  } | null
}

export function WeeklyCheckInForm({ data }: { data: FormData }) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [overallMood, setOverallMood] = useState(
    data.existingCheckIn?.overallMood ?? 3
  )
  const [notes, setNotes] = useState(data.existingCheckIn?.notes ?? "")
  const [goalRatings, setGoalRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const gc of data.existingCheckIn?.goalCheckIns ?? []) {
      init[gc.goalId] = gc.progressRating
    }
    for (const g of data.goals) {
      if (!(g.id in init)) init[g.id] = 3
    }
    return init
  })
  const [goalNotes, setGoalNotes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const gc of data.existingCheckIn?.goalCheckIns ?? []) {
      if (gc.notes) init[gc.goalId] = gc.notes
      if (gc.blockers) init[`${gc.goalId}_blockers`] = gc.blockers
    }
    return init
  })

  const alreadyDone = !!data.existingCheckIn

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (alreadyDone) {
      toast.info("You've already completed this week's check-in.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/check-ins/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          overallMood,
          notes: notes.trim() || undefined,
          goalCheckIns: data.goals.map((g) => ({
            goalId: g.id,
            progressRating: goalRatings[g.id] ?? 3,
            notes: goalNotes[g.id]?.trim() || undefined,
            blockers: goalNotes[`${g.id}_blockers`]?.trim() || undefined,
          })),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to save")
      }
      toast.success("Check-in saved!", {
        description: "Your streak is building. Keep it up!",
      })
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.goals.length === 0) {
    return (
      <div className="relative">
        <MandalaWatermark position="top-right" size="sm" />
        <EmptyState
          icon={ClipboardCheck}
          title="No goals to check in on"
          description="Create your yearly plan and add goals first. Then you can track your weekly progress here."
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
          Weekly Check-in
        </h1>
        <p className="text-muted-foreground mt-1">
          Week {data.weekNumber} of {data.year} — Take 60 seconds to reflect.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      {alreadyDone ? (
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <ClipboardCheck className="h-6 w-6" />
              <div>
                <p className="font-medium">You&apos;ve already completed this week&apos;s check-in.</p>
                <p className="text-sm text-muted-foreground">
                  Come back next week to keep your streak going.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Smile className="h-4 w-4 text-accent" /> How&apos;s your week?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Overall mood (1 = rough, 5 = great)
                </p>
                <Slider
                  value={[overallMood]}
                  onValueChange={([v]) => setOverallMood(v)}
                  min={1}
                  max={5}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Rough</span>
                  <span>Great</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What stood out this week? Wins, challenges, gratitude..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">
                Goal Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Rate each goal from 1 (stalled) to 5 (crushing it)
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {data.goals.map((goal) => {
                const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
                return (
                  <div key={goal.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {catInfo && (
                        <catInfo.icon
                          className="h-4 w-4 shrink-0"
                          style={{ color: catInfo.color }}
                        />
                      )}
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <Slider
                      value={[goalRatings[goal.id] ?? 3]}
                      onValueChange={([v]) =>
                        setGoalRatings((prev) => ({ ...prev, [goal.id]: v }))
                      }
                      min={1}
                      max={5}
                      step={1}
                    />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Notes
                        </label>
                        <Input
                          value={goalNotes[goal.id] ?? ""}
                          onChange={(e) =>
                            setGoalNotes((prev) => ({
                              ...prev,
                              [goal.id]: e.target.value,
                            }))
                          }
                          placeholder="Wins, learnings..."
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Blockers
                        </label>
                        <Input
                          value={goalNotes[`${goal.id}_blockers`] ?? ""}
                          onChange={(e) =>
                            setGoalNotes((prev) => ({
                              ...prev,
                              [`${goal.id}_blockers`]: e.target.value,
                            }))
                          }
                          placeholder="What's in the way?"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ClipboardCheck className="mr-2 h-4 w-4" />
            )}
            Save Check-in
          </Button>
        </form>
      )}
    </div>
  )
}

