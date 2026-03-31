"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import Link from "next/link"
import {
  Repeat,
  Loader2,
  CheckCircle2,
  Sparkles,
  Target,
  Compass,
  Flame,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { HabitsHeatmap } from "@/components/systems/habits-heatmap"

interface System {
  id: string
  description: string
  frequency: string
  isCompleted: boolean
  goal: { id: string; title: string; category: string }
}

interface WeeklyFocusPayload {
  goals: { id: string; title: string }[]
  protectCategory: string | null
}

export function SystemsTracker() {
  const router = useRouter()
  const [systems, setSystems] = useState<System[]>([])
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set())

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const completed = systems.filter((s) => s.isCompleted).length
  const total = systems.length
  const progress = total > 0 ? (completed / total) * 100 : 0
  const allDone = total > 0 && completed === total

  const byGoal = useMemo(() => {
    return systems.reduce<Record<string, System[]>>((acc, s) => {
      const key = s.goal.id
      if (!acc[key]) acc[key] = []
      acc[key].push(s)
      return acc
    }, {})
  }, [systems])

  function toggleGoalCollapse(goalId: string) {
    setCollapsedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }

  async function fetchSystems() {
    try {
      const res = await fetch("/api/systems/today")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setSystems(json.data.systems ?? [])
      setWeeklyFocus(
        json.data.weeklyFocus ?? { goals: [], protectCategory: null }
      )
    } catch {
      toast.error("Failed to load systems")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystems()
  }, [])

  async function toggleComplete(system: System) {
    setToggling(system.id)
    const date = new Date().toISOString().slice(0, 10)
    try {
      const res = await fetch("/api/systems/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: system.id,
          date,
          completed: !system.isCompleted,
        }),
      })
      if (!res.ok) throw new Error("Failed to update")
      const json = await res.json()
      setSystems((prev) =>
        prev.map((s) =>
          s.id === system.id ? { ...s, isCompleted: !s.isCompleted } : s
        )
      )
      if (json.data?.allSystemsDone) {
        toast.success("Perfect day!", {
          description: "All habits complete. Keep the streak alive!",
        })
      }
      router.refresh()
    } catch {
      toast.error("Failed to update")
    } finally {
      setToggling(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    )
  }

  if (systems.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Daily Habits</h1>
          <p className="text-muted-foreground mt-1 text-sm">{today}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
          {["Morning routine", "Read 20 min", "Exercise"].map((example) => (
            <div key={example} className="rounded-lg border border-dashed p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                <span className="text-sm text-muted-foreground">{example}</span>
              </div>
            </div>
          ))}
        </div>

        <EmptyState
          icon={Repeat}
          title="Your daily habits live here"
          description="Once you create goals, attach small repeatable habits to each one. Check them off every day to build streaks and stay consistent."
          action={
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/goals">Go to your goals</Link>
              </Button>
              <Button asChild>
                <Link href="/plan/new">
                  <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Daily Habits</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{today}</p>
        </div>
        {allDone && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
            All done
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Today&apos;s progress</span>
            <span className="font-medium tabular-nums">{completed}/{total}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Weekly focus banner */}
      {weeklyFocus && (weeklyFocus.goals.length > 0 || weeklyFocus.protectCategory) && (
        <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm">
          <Compass className="h-4 w-4 text-accent mt-0.5 shrink-0" />
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">This week&apos;s focus</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {weeklyFocus.goals.map((g) => (
                <Link
                  key={g.id}
                  href={`/goals/${g.id}`}
                  className="text-accent font-medium hover:underline"
                >
                  {g.title}
                </Link>
              ))}
              {weeklyFocus.protectCategory && (
                <span className="text-muted-foreground">
                  Protecting:{" "}
                  <span className="font-medium text-foreground">
                    {LIFE_CATEGORIES.find((c) => c.id === weeklyFocus.protectCategory)?.label ?? weeklyFocus.protectCategory}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Goal groups */}
      <div className="space-y-3">
        {Object.entries(byGoal).map(([goalId, goalSystems]) => {
          const goal = goalSystems[0]!.goal
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          const goalCompleted = goalSystems.filter((s) => s.isCompleted).length
          const goalTotal = goalSystems.length
          const goalDone = goalCompleted === goalTotal
          const isCollapsed = collapsedGoals.has(goalId)

          return (
            <Card key={goalId} className="overflow-hidden">
              <button
                onClick={() => toggleGoalCollapse(goalId)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: catInfo?.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{goal.title}</span>
                    {goalDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {goalCompleted}/{goalTotal}
                </span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                  isCollapsed && "-rotate-90"
                )} />
              </button>

              {!isCollapsed && (
                <CardContent className="pt-0 pb-2 px-4 space-y-1">
                  {goalSystems.map((sys) => (
                    <label
                      key={sys.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:bg-muted/50",
                        sys.isCompleted && "bg-muted/20"
                      )}
                    >
                      <Checkbox
                        checked={sys.isCompleted}
                        onCheckedChange={() => toggleComplete(sys)}
                        disabled={toggling === sys.id}
                      />
                      {toggling === sys.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <span
                          className={cn(
                            "text-sm flex-1",
                            sys.isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {sys.description}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground shrink-0">
                        {sys.frequency}
                      </span>
                    </label>
                  ))}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <HabitsHeatmap />
    </div>
  )
}
