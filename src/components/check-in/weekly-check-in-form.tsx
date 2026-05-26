"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Slider } from "@/components/ui/slider"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { ClipboardCheck, Loader2, Pencil, Sparkles, Smile, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { WeeklyCommitment } from "@/types/weekly"
import { WeeklyPlanSummary } from "@/components/check-in/weekly-plan-summary"

interface ProjectRow {
  id: string
  title: string
  category: string
}

interface FormData {
  plan: { id: string; year: number }
  projects: ProjectRow[]
  weekNumber: number
  year: number
  weeklyPlan?: {
    priorityProjectIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
  existingCheckIn: {
    id: string
    overallMood: number | null
    notes: string | null
    nextWeekFocus?: string | null
    projectCheckIns: { projectId: string; progressRating: number; notes: string | null; blockers: string | null }[]
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
  // When `editing` is true we render the form pre-populated with the
  // existing check-in's data and submit via PATCH instead of POST.
  // Only allowed for the current ISO week (the server also enforces this).
  const [editing, setEditing] = useState(false)
  const [overallMood, setOverallMood] = useState(
    data.existingCheckIn?.overallMood ?? 3
  )
  const [notes, setNotes] = useState(data.existingCheckIn?.notes ?? "")
  const [projectRatings, setProjectRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const gc of data.existingCheckIn?.projectCheckIns ?? []) {
      init[gc.projectId] = gc.progressRating
    }
    for (const g of data.projects) {
      if (!(g.id in init)) init[g.id] = 3
    }
    return init
  })
  const [nextWeekFocus, setNextWeekFocus] = useState(
    data.existingCheckIn?.nextWeekFocus ?? "",
  )

  const [projectNotes, setProjectNotes] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const gc of data.existingCheckIn?.projectCheckIns ?? []) {
      if (gc.notes) init[gc.projectId] = gc.notes
      if (gc.blockers) init[`${gc.projectId}_blockers`] = gc.blockers
    }
    return init
  })

  const alreadyDone = !!data.existingCheckIn

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const isEditing = alreadyDone && editing
      const url = isEditing
        ? `/api/check-ins/weekly/${data.existingCheckIn!.id}`
        : "/api/check-ins/weekly"
      const method = isEditing ? "PATCH" : "POST"
      const payload = isEditing
        ? {
            overallMood,
            notes: notes.trim() || undefined,
            nextWeekFocus: nextWeekFocus.trim() || undefined,
            projectCheckIns: data.projects.map((g) => ({
              projectId: g.id,
              progressRating: projectRatings[g.id] ?? 3,
              notes: projectNotes[g.id]?.trim() || undefined,
              blockers: projectNotes[`${g.id}_blockers`]?.trim() || undefined,
            })),
          }
        : {
            planId: data.plan.id,
            overallMood,
            notes: notes.trim() || undefined,
            nextWeekFocus: nextWeekFocus.trim() || undefined,
            projectCheckIns: data.projects.map((g) => ({
              projectId: g.id,
              progressRating: projectRatings[g.id] ?? 3,
              notes: projectNotes[g.id]?.trim() || undefined,
              blockers: projectNotes[`${g.id}_blockers`]?.trim() || undefined,
            })),
          }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || err.error || "Failed to save")
      }
      if (alreadyDone && editing) {
        setEditing(false)
      }
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.projects.length === 0) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Add projects to review your week"
        description="Your weekly review is based on your yearly projects. Create a project first, then come back."
        action={
          <Button asChild>
            <Link href="/projects">
              <Sparkles className="mr-2 h-4 w-4" /> Go to projects
            </Link>
          </Button>
        }
      />
    )
  }

  if (alreadyDone && !editing) {
    const mood = data.existingCheckIn?.overallMood
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 border border-status-positive/30 bg-status-positive/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-status-positive shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">Week {data.weekNumber} reviewed</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mood ? `Mood: ${MOOD_LABELS[mood]}` : ""}
              {mood ? " · " : ""}Come back next week to keep the streak going.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        </div>

        {data.existingCheckIn?.projectCheckIns && data.existingCheckIn.projectCheckIns.length > 0 && (
          <section className="border border-border">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-muted-foreground">Project ratings</h2>
            </header>
            <div className="px-4 py-4 space-y-2">
              {data.existingCheckIn.projectCheckIns.map((gc) => {
                const goal = data.projects.find((g) => g.id === gc.projectId)
                if (!goal) return null
                const cat = LIFE_CATEGORIES.find((c) => c.id === goal.category)
                return (
                  <div key={gc.projectId} className="flex items-center gap-3 text-sm">
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
            </div>
          </section>
        )}

        {data.existingCheckIn?.nextWeekFocus && (
          <section className="border border-border">
            <header className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-muted-foreground">Note for next week</h2>
            </header>
            <div className="px-4 py-4">
              <div
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichTextHtml(data.existingCheckIn.nextWeekFocus),
                }}
              />
            </div>
          </section>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WeeklyPlanSummary projects={data.projects} weeklyPlan={data.weeklyPlan ?? null} />

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3">
          <h2 className="text-base font-display flex items-center gap-2">
            <Smile className="h-4 w-4 text-accent" /> How&apos;s your week?
          </h2>
        </header>
        <div className="px-4 py-4 space-y-4">
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
        </div>
      </section>

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 space-y-1">
          <h2 className="text-base font-display">
            Project progress
          </h2>
          <p className="text-sm text-muted-foreground">
            Rate each project from 1 (stalled) to 5 (crushing it)
          </p>
        </header>
        <div className="px-4 py-4 space-y-6">
          {data.projects.map((project) => {
            const catInfo = LIFE_CATEGORIES.find((c) => c.id === project.category)
            return (
              <div key={project.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  {catInfo && (
                    <catInfo.icon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: catInfo.color }}
                    />
                  )}
                  <span className="text-sm font-medium">{project.title}</span>
                  <span className="text-xs text-muted-foreground ml-auto tabular-nums">
                    {projectRatings[project.id] ?? 3}/5
                  </span>
                </div>
                <Slider
                  value={[projectRatings[project.id] ?? 3]}
                  onValueChange={([v]) =>
                    setProjectRatings((prev) => ({ ...prev, [project.id]: v }))
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
                      value={projectNotes[project.id] ?? ""}
                      onChange={(e) =>
                        setProjectNotes((prev) => ({
                          ...prev,
                          [project.id]: e.target.value,
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
                      value={projectNotes[`${project.id}_blockers`] ?? ""}
                      onChange={(e) =>
                        setProjectNotes((prev) => ({
                          ...prev,
                          [`${project.id}_blockers`]: e.target.value,
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
        </div>
      </section>

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 space-y-1">
          <h2 className="text-base font-display">
            Looking ahead (optional)
          </h2>
          <p className="text-sm text-muted-foreground">
            One note you&apos;ll see when you plan next week — top priority,
            a habit to protect, or something to carry over.
          </p>
        </header>
        <div className="px-4 py-4">
          <RichTextEditor
            value={nextWeekFocus}
            onChange={(val) => setNextWeekFocus(val)}
            placeholder="e.g. Protect sleep · Ship the draft · Book the dentist"
            rows={2}
            className="bg-card"
          />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 border-t border-border/80 bg-background/95 px-1 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:static sm:z-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:pb-0 sm:backdrop-blur-none">
        {editing && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setEditing(false)}
            disabled={submitting}
            className="min-h-11"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          size="lg"
          className="min-h-11 flex-1"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="mr-2 h-4 w-4" />
          )}
          {editing ? "Update review" : "Save review"}
        </Button>
      </div>
    </form>
  )
}
