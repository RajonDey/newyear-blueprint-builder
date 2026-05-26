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
  Compass,
  ChevronDown,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { HabitsHeatmap } from "@/components/systems/habits-heatmap"
import { RhythmWorkspaceShell } from "@/components/rhythm/rhythm-workspace-shell"
import { WeeklyFocusBanner } from "@/components/rhythm/weekly-focus-banner"

interface System {
  id: string
  description: string
  frequency: string
  isCompleted: boolean
  goal: { id: string; title: string; category: string }
}

interface WeeklyFocusPayload {
  projects: { id: string; title: string }[]
  protectCategory: string | null
}

export function SystemsTracker({
  initialSystems,
  initialWeeklyFocus,
}: {
  initialSystems?: System[]
  initialWeeklyFocus?: WeeklyFocusPayload | null
} = {}) {
  const router = useRouter()
  const [systems, setSystems] = useState<System[]>(initialSystems ?? [])
  const [weeklyFocus, setWeeklyFocus] = useState<WeeklyFocusPayload | null>(
    initialWeeklyFocus ?? null,
  )
  const [loading, setLoading] = useState(initialSystems === undefined)
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

  function toggleGoalCollapse(projectId: string) {
    setCollapsedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
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
        json.data.weeklyFocus ?? { projects: [], protectCategory: null }
      )
    } catch {
      toast.error("Failed to load systems")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialSystems !== undefined) return
    fetchSystems()
  }, [initialSystems])

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
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-3">
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
          description="Once you create projects, attach small repeatable habits to each one. Check them off every day to build streaks and stay consistent."
          action={
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link href="/projects">Go to your projects</Link>
              </Button>
              <Button asChild>
                <Link href="/onboarding">
                  <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
                </Link>
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  const sidebar = (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{today}</p>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="text-muted-foreground">Progress</span>
            <div className="flex items-center gap-2">
              {allDone && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium uppercase tracking-wide">
                  <CheckCircle2 className="h-3 w-3" />
                  All done
                </span>
              )}
              <span className="font-medium tabular-nums">{completed}/{total}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {weeklyFocus && (weeklyFocus.projects.length > 0 || weeklyFocus.protectCategory) && (
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-accent" />
              This week&apos;s focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {weeklyFocus.projects.map((g) => (
              <Link
                key={g.id}
                href={`/projects/${g.id}`}
                className="block text-accent font-medium hover:underline"
              >
                {g.title}
              </Link>
            ))}
            {weeklyFocus.protectCategory && (
              <p className="text-muted-foreground text-xs">
                Protecting{" "}
                <span className="font-medium text-foreground">
                  {LIFE_CATEGORIES.find((c) => c.id === weeklyFocus.protectCategory)?.label ??
                    weeklyFocus.protectCategory}
                </span>
              </p>
            )}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/rhythm/weekly">Open weekly planner</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <HabitsHeatmap />
    </>
  )

  return (
    <RhythmWorkspaceShell sidebar={sidebar} sidebarFirstOnMobile={false}>
      {weeklyFocus &&
        (weeklyFocus.projects.length > 0 || weeklyFocus.protectCategory) && (
          <WeeklyFocusBanner
            projects={weeklyFocus.projects}
            protectCategory={weeklyFocus.protectCategory}
          />
        )}
      <div className="space-y-3 mt-4">
        {Object.entries(byGoal).map(([projectId, goalSystems]) => {
          const goal = goalSystems[0]!.goal
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          const goalCompleted = goalSystems.filter((s) => s.isCompleted).length
          const goalTotal = goalSystems.length
          const goalDone = goalCompleted === goalTotal
          const isCollapsed = collapsedGoals.has(projectId)

          return (
            <Card key={projectId} className="overflow-hidden">
              <button
                onClick={() => toggleGoalCollapse(projectId)}
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
    </RhythmWorkspaceShell>
  )
}
