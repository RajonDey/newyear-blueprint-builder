"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Repeat, Loader2, CheckCircle2, Sparkles, Target } from "lucide-react"
import { toast } from "sonner"

interface System {
  id: string
  description: string
  frequency: string
  isCompleted: boolean
  goal: { id: string; title: string; category: string }
}

export function SystemsTracker() {
  const router = useRouter()
  const [systems, setSystems] = useState<System[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const completed = systems.filter((s) => s.isCompleted).length
  const total = systems.length
  const progress = total > 0 ? (completed / total) * 100 : 0
  const allDone = total > 0 && completed === total

  async function fetchSystems() {
    try {
      const res = await fetch("/api/systems/today")
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      setSystems(json.data.systems ?? [])
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
          s.id === system.id
            ? { ...s, isCompleted: !s.isCompleted }
            : s
        )
      )
      if (json.data?.allSystemsDone) {
        toast.success("Perfect Day!", {
          description: "You completed all your daily systems. 🎉",
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
      <div className="relative">
        <MandalaWatermark position="top-right" size="sm" />
        <EmptyState
          icon={Repeat}
          title="No daily systems yet"
          description="Create your yearly plan and add daily systems to your goals. They'll appear here for you to track."
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

  const byGoal = systems.reduce<Record<string, System[]>>((acc, s) => {
    const key = s.goal.id
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="relative space-y-8">
      <MandalaWatermark position="top-right" size="sm" />

      <div>
        <h1 className="font-display text-3xl font-semibold">
          Daily Systems
        </h1>
        <p className="text-muted-foreground mt-1">{today}</p>
      </div>

      <OrnamentDivider variant="lotus" />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" /> Today&apos;s Progress
            </CardTitle>
            <span className="text-sm font-medium">
              {completed}/{total}
            </span>
          </div>
          <Progress value={progress} className="h-2 mt-2" />
          {allDone && (
            <div className="flex items-center gap-2 mt-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">All done! Perfect day.</span>
            </div>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {Object.entries(byGoal).map(([goalId, goalSystems]) => {
          const goal = goalSystems[0]!.goal
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          return (
            <Card key={goalId} className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: catInfo?.color }}
              />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {catInfo && <catInfo.icon className="h-4 w-4" style={{ color: catInfo.color }} />}
                  {goal.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {goalSystems.map((sys) => (
                  <label
                    key={sys.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      sys.isCompleted ? "bg-muted/30 border-emerald-200 dark:border-emerald-900/50" : ""
                    }`}
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
                        className={`text-sm flex-1 ${
                          sys.isCompleted ? "line-through text-muted-foreground" : ""
                        }`}
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
            </Card>
          )
        })}
      </div>
    </div>
  )
}
