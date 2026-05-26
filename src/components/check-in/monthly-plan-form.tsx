"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { monthLabel } from "@/lib/months"
import { useCadencePlanFormState } from "@/lib/rhythm/plan-form-state"
import type { GoalStatus } from "@prisma/client"
import {
  CalendarDays,
  Compass,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { QuarterlyFocusPanel } from "@/components/check-in/quarterly-focus-panel"
import type { QuarterlyFocusContext } from "@/lib/queries/rhythm-context"

interface PlanRow {
  month: number
  year: number
  monthFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

interface Goal {
  id: string
  title: string
  category: string
  status: GoalStatus
}

const MONTH_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const

function getMonthKey(row: PlanRow) {
  return row.month
}

function getMonthFocus(row: PlanRow) {
  return row.monthFocus
}

export function MonthlyPlanForm({
  activeMonth,
  data,
  plans,
  quarterlyContext,
}: {
  activeMonth: number
  data: {
    plan: { id: string; year: number }
    projects: Goal[]
  }
  plans: PlanRow[]
  quarterlyContext?: QuarterlyFocusContext | null
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const activeGoals = useMemo(
    () => data.projects.filter((g) => g.status !== "COMPLETED"),
    [data.projects],
  )

  const planState = useCadencePlanFormState({
    plans,
    getKey: getMonthKey,
    getFocus: getMonthFocus,
    emptyKeys: [...MONTH_KEYS],
    topIntentionCapLabel: "month",
  })

  const monthFocus = planState.focusFor(activeMonth)
  const projectIntentions = planState.projectIntentionsFor(activeMonth)
  const topIntentions = planState.topIntentionsFor(activeMonth)

  async function save() {
    setSaving(true)
    try {
      const projectRows = activeGoals
        .map((g) => ({
          projectId: g.id,
          text: (projectIntentions[g.id] ?? "").trim(),
        }))
        .filter((row) => row.text.length > 0)

      const topRows = topIntentions.map((s) => s.trim()).filter(Boolean)

      const res = await fetch("/api/monthly/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          month: activeMonth,
          year: data.plan.year,
          monthFocus: monthFocus.trim() || undefined,
          projectIntentions: projectRows,
          topIntentions: topRows,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to save")
      toast.success(`${monthLabel(activeMonth)} plan saved`)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (data.projects.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Monthly plans live here"
        description="Create projects first, then set a focus theme and intentions for each month."
        action={
          <Button asChild>
            <a href="/onboarding">
              <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
            </a>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <QuarterlyFocusPanel context={quarterlyContext} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent" />
            {monthLabel(activeMonth)} {data.plan.year} — plan
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Set the theme for this month before the weeks begin. Your weekly
            planner picks this up automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-accent shrink-0" />
              Month focus theme
            </label>
            <RichTextEditor
              value={monthFocus}
              onChange={(next) => planState.setFocus(activeMonth, next)}
              placeholder="What's the one theme or outcome for this month?"
              rows={3}
              className="bg-card"
            />
          </div>

          {activeGoals.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-accent shrink-0" />
                  Project intentions
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  One sentence per active project — what progress should this
                  month show?
                </p>
              </div>
              <div className="space-y-2">
                {activeGoals.map((g) => {
                  const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
                  return (
                    <div key={g.id} className="space-y-1">
                      <label className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                        {cat && (
                          <cat.icon
                            className="h-3 w-3 shrink-0"
                            style={{ color: cat.color }}
                          />
                        )}
                        {g.title}
                      </label>
                      <Input
                        value={projectIntentions[g.id] ?? ""}
                        onChange={(e) =>
                          planState.setProjectIntention(
                            activeMonth,
                            g.id,
                            e.target.value,
                          )
                        }
                        placeholder="This month I will…"
                        className="bg-card"
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2 border-t border-border/60">
            <div>
              <p className="text-sm font-medium">Top intentions (up to 3)</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Non-negotiables that should shape your weekly plans.
              </p>
            </div>
            <div className="space-y-2">
              {topIntentions.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={row}
                    onChange={(e) =>
                      planState.setTopIntention(activeMonth, i, e.target.value)
                    }
                    placeholder={`Intention ${i + 1}`}
                    className="bg-card"
                  />
                  {topIntentions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        planState.removeTopIntention(activeMonth, i)
                      }
                      aria-label="Remove intention"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {topIntentions.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => planState.addTopIntention(activeMonth)}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add intention
                </Button>
              )}
            </div>
          </div>

          <Button type="button" onClick={save} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Compass className="mr-2 h-4 w-4" />
            )}
            Save {monthLabel(activeMonth)} plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
