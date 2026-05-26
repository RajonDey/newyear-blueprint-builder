"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import {
  quarterLabel,
  quarterMonthsLabel,
  type QuarterValue,
} from "@/lib/quarters"
import { useCadencePlanFormState } from "@/lib/rhythm/plan-form-state"
import {
  Activity,
  Compass,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

interface PlanRow {
  quarter: string
  year: number
  quarterFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

interface Goal {
  id: string
  title: string
  category: string
  status: string
}

const QUARTER_KEYS: QuarterValue[] = ["Q1", "Q2", "Q3", "Q4"]

function getQuarterKey(row: PlanRow) {
  return row.quarter
}

function getQuarterFocus(row: PlanRow) {
  return row.quarterFocus
}

export function QuarterlyPlanForm({
  activeQuarter,
  data,
  plans,
}: {
  activeQuarter: QuarterValue
  data: {
    plan: { id: string; year: number }
    projects: Goal[]
  }
  plans: PlanRow[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const activeGoals = useMemo(
    () => data.projects.filter((g) => g.status !== "COMPLETED"),
    [data.projects],
  )

  const planState = useCadencePlanFormState({
    plans,
    getKey: getQuarterKey,
    getFocus: getQuarterFocus,
    emptyKeys: QUARTER_KEYS,
    topIntentionCapLabel: "quarter",
  })

  const quarterFocus = planState.focusFor(activeQuarter)
  const projectIntentions = planState.projectIntentionsFor(activeQuarter)
  const topIntentions = planState.topIntentionsFor(activeQuarter)

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

      const res = await fetch("/api/quarterly/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          quarter: activeQuarter,
          year: data.plan.year,
          quarterFocus: quarterFocus.trim() || undefined,
          projectIntentions: projectRows,
          topIntentions: topRows,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to save")
      toast.success(`${quarterLabel(activeQuarter)} plan saved`)
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
        icon={Activity}
        title="Quarterly plans live here"
        description="Create projects first, then set a focus theme and intentions for each quarter."
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Compass className="h-4 w-4 text-accent" />
            {quarterLabel(activeQuarter)} {data.plan.year} — plan
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {quarterMonthsLabel(activeQuarter)} · set the season theme before
            months and weeks unfold. Your monthly planner picks this up
            automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-accent shrink-0" />
              Quarter focus theme
            </label>
            <RichTextEditor
              value={quarterFocus}
              onChange={(next) => planState.setFocus(activeQuarter, next)}
              placeholder="What's the one theme or outcome for this quarter?"
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
                  One sentence per active project — what should this quarter
                  deliver?
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
                            activeQuarter,
                            g.id,
                            e.target.value,
                          )
                        }
                        placeholder="This quarter I will…"
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
                Non-negotiables that should shape your monthly and weekly plans.
              </p>
            </div>
            <div className="space-y-2">
              {topIntentions.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={row}
                    onChange={(e) =>
                      planState.setTopIntention(activeQuarter, i, e.target.value)
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
                        planState.removeTopIntention(activeQuarter, i)
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
                  onClick={() => planState.addTopIntention(activeQuarter)}
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
            Save {quarterLabel(activeQuarter)} plan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
