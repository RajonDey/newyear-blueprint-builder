"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Compass, Loader2, Plus, Target, Trash2, Sparkles, CalendarCheck } from "lucide-react"
import { toast } from "sonner"
import type { WeeklyCommitment } from "@/types/weekly"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Goal {
  id: string
  title: string
  category: string
}

const PROTECT_SELECT_VALUES = new Set<string>([
  "NONE",
  ...LIFE_CATEGORIES.map((c) => c.id),
])

interface WeeklyPlanFormProps {
  planId: string
  planYear: number
  goals: Goal[]
  weekNumber: number
  year: number
  initialPlan: {
    priorityGoalIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
  suggestionFromLastWeek: string | null
}

export function WeeklyPlanForm({
  planId,
  planYear,
  goals,
  weekNumber,
  year,
  initialPlan,
  suggestionFromLastWeek,
}: WeeklyPlanFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [priorityIds, setPriorityIds] = useState<string[]>(
    initialPlan?.priorityGoalIds ?? []
  )
  const [protect, setProtect] = useState<string>(() => {
    const c = initialPlan?.protectCategory
    if (c && PROTECT_SELECT_VALUES.has(c)) return c
    return "NONE"
  })
  const [commitments, setCommitments] = useState<WeeklyCommitment[]>(() =>
    initialPlan?.commitments && initialPlan.commitments.length > 0
      ? initialPlan.commitments
      : [{ text: "", kind: "core" }]
  )

  function addCommitment(kind: WeeklyCommitment["kind"]) {
    setCommitments((c) => {
      if (c.length >= 12) {
        toast.info("Maximum 12 commitments for one week.")
        return c
      }
      return [...c, { text: "", kind }]
    })
  }

  function updateCommitment(i: number, patch: Partial<WeeklyCommitment>) {
    setCommitments((rows) =>
      rows.map((row, j) => (j === i ? { ...row, ...patch } : row))
    )
  }

  function removeCommitment(i: number) {
    setCommitments((rows) => rows.filter((_, j) => j !== i))
  }

  async function save() {
    const filled = commitments
      .map((c) => ({ ...c, text: c.text.trim() }))
      .filter((c) => c.text.length > 0)
    setSaving(true)
    try {
      const res = await fetch("/api/weekly-plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          priorityGoalIds: priorityIds,
          protectCategory: protect === "NONE" ? null : protect,
          commitments: filled.length ? filled : [],
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error || "Failed to save")
      toast.success("Weekly plan saved")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Add goals to plan your week"
        description="Your weekly plan is based on your yearly goals. Create goals first, then come back to set weekly priorities."
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

  return (
    <div className="space-y-6">
      {suggestionFromLastWeek && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm">
          <Compass className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">From last week&apos;s review</p>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(suggestionFromLastWeek) }}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Target className="h-4 w-4 text-accent" />
            Priority goals (up to 3)
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            These stay top-of-mind on your Daily Habits page.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {goals.map((g) => {
            const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
            const checked = priorityIds.includes(g.id)
            return (
              <label
                key={g.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                  checked && "border-accent/50 bg-accent/5"
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    if (v === true) {
                      setPriorityIds((prev) => {
                        if (prev.includes(g.id)) return prev
                        if (prev.length >= 3) {
                          toast.info("Choose up to three priority goals for the week.")
                          return prev
                        }
                        return [...prev, g.id]
                      })
                    } else {
                      setPriorityIds((prev) => prev.filter((x) => x !== g.id))
                    }
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {cat && (
                      <cat.icon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />
                    )}
                    <span className="text-sm font-medium">{g.title}</span>
                  </div>
                </div>
              </label>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Life area to protect
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Optional — one domain you won&apos;t let slip this week.
          </p>
        </CardHeader>
        <CardContent>
          <Select value={protect} onValueChange={setProtect}>
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">None</SelectItem>
              {LIFE_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Commitments</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Core = tied to yearly goals. Follow-up = admin, errands, small wins.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {commitments.map((row, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="sr-only">Commitment {i + 1}</Label>
                <Input
                  value={row.text}
                  onChange={(e) => updateCommitment(i, { text: e.target.value })}
                  placeholder="What will you do this week?"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                <Select
                  value={row.kind}
                  onValueChange={(v) =>
                    updateCommitment(i, { kind: v as WeeklyCommitment["kind"] })
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core">Core</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCommitment(i)}
                  disabled={commitments.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommitment("core")}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Core
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCommitment("follow_up")}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Follow-up
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={save} disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save weekly plan
      </Button>
    </div>
  )
}
