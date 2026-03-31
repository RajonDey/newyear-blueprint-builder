"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Slider } from "@/components/ui/slider"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { ClipboardCheck, Loader2, Sparkles, Smile, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

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
    nextWeekFocus?: string | null
    goalCheckIns: { goalId: string; progressRating: number; notes: string | null; blockers: string | null }[]
  } | null
}

const MOOD_LABELS = ["", "Rough", "Tough", "Okay", "Good", "Great"]

export function WeeklyCheckInForm({
  data,
  embedded = false,
}: {
  data: FormData
  embedded?: boolean
}) {
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
  const [nextWeekFocus, setNextWeekFocus] = useState("")

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
      toast.info("You've already completed this week's review.")
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
          nextWeekFocus: nextWeekFocus.trim() || undefined,
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
      const json = await res.json()
      const streak = json.streak ?? 0
      const newAchievements: string[] = json.newAchievements ?? []

      if (newAchievements.length > 0) {
        const label =
          newAchievements.includes("first_check_in")
            ? "Achievement unlocked: First Step!"
            : `Achievement unlocked: ${streak}-week streak!`
        toast.success(label, {
          description: "You're building something real. Keep showing up.",
          duration: 5000,
        })
      } else {
        toast.success("Weekly review saved!", {
          description: streak > 1
            ? `${streak}-week streak and counting!`
            : "Your streak is building. Keep it up!",
        })
      }
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.goals.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Add goals to review your week"
        description="Your weekly review is based on your yearly goals. Create goals first, then come back."
        action={
          <Button asChild>
            <Link href="/goals">
              <Sparkles className="mr-2 h-4 w-4" /> Go to goals
            </Link>
          </Button>
        }
      />
    )
  }

  if (alreadyDone) {
    const mood = data.existingCheckIn?.overallMood
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <p className="font-medium text-sm">Week {data.weekNumber} reviewed</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mood ? `Mood: ${MOOD_LABELS[mood]}` : ""}
              {mood ? " · " : ""}Come back next week to keep the streak going.
            </p>
          </div>
        </div>

        {data.existingCheckIn?.goalCheckIns && data.existingCheckIn.goalCheckIns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Goal ratings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.existingCheckIn.goalCheckIns.map((gc) => {
                const goal = data.goals.find((g) => g.id === gc.goalId)
                if (!goal) return null
                const cat = LIFE_CATEGORIES.find((c) => c.id === goal.category)
                return (
                  <div key={gc.goalId} className="flex items-center gap-3 text-sm">
                    {cat && <cat.icon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />}
                    <span className="flex-1 truncate">{goal.title}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`h-2 w-4 rounded-sm ${
                            n <= gc.progressRating
                              ? "bg-accent"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {data.existingCheckIn?.nextWeekFocus && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Note for next week</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichTextHtml(data.existingCheckIn.nextWeekFocus),
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Smile className="h-4 w-4 text-accent" /> How&apos;s your week?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall mood</span>
              <span className="font-medium">{MOOD_LABELS[overallMood]}</span>
            </div>
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
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Notes (optional)</label>
            <RichTextEditor
              value={notes}
              onChange={(val) => setNotes(val)}
              placeholder="What stood out this week? Wins, challenges, gratitude..."
              rows={3}
              className="bg-card"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">
            Goal Progress
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
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
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: catInfo.color }}
                    />
                  )}
                  <span className="text-sm font-medium">{goal.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                    {goalRatings[goal.id] ?? 3}/5
                  </span>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">
            Looking ahead (optional)
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            One note you&apos;ll see when you plan next week — top priority,
            a habit to protect, or something to carry over.
          </p>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={nextWeekFocus}
            onChange={(val) => setNextWeekFocus(val)}
            placeholder="e.g. Protect sleep · Ship the draft · Book the dentist"
            rows={2}
            className="bg-card"
          />
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
        Save review
      </Button>
    </form>
  )
}
