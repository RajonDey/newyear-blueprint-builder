"use client"

import { useRouter } from "next/navigation"
import { useWizardStore, WIZARD_STEPS } from "@/stores/wizard-store"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import {
  ArrowLeft,
  Rocket,
  Target,
  Calendar,
  Repeat,
  ShieldOff,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export function StepReview() {
  const router = useRouter()
  const store = useWizardStore()
  const {
    year,
    reflections,
    goals,
    antiGoals,
    isSubmitting,
    setSubmitting,
    prevStep,
    reset,
  } = store

  async function handleActivate() {
    setSubmitting(true)
    try {
      const payload = {
        year,
        reflections,
        goals: goals.map((g) => ({
          category: g.category,
          type: g.type,
          title: g.title,
          description: g.description || undefined,
          motivation: {
            whyText: g.whyText || "",
            consequenceText: g.consequenceText || "",
          },
          checkpoints: g.checkpoints.filter((cp) => cp.title.trim()),
          systems: g.systems.filter((s) => s.description.trim()),
        })),
        antiGoals: antiGoals
          .filter((a) => a.description.trim())
          .map((a) => ({
            description: a.description,
            category: a.category || undefined,
          })),
      }

      const res = await fetch("/api/plans/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to create plan")
      }

      toast.success("Your plan is alive!", {
        description: `${year} plan created with ${goals.length} goal${goals.length !== 1 ? "s" : ""}.`,
      })

      reset()
      router.push("/dashboard")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasReflections = Object.values(reflections).some((v) => v.trim())
  const totalSystems = goals.reduce((s, g) => s + g.systems.length, 0)
  const totalCheckpoints = goals.reduce((s, g) => s + g.checkpoints.length, 0)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Rocket className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">
          Bring It to Life
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Review your {year} plan. When you&apos;re ready, activate it and begin
          your journey.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4 max-w-2xl mx-auto">
        <SummaryCard icon={Target} label="Goals" value={goals.length} />
        <SummaryCard icon={Calendar} label="Checkpoints" value={totalCheckpoints} />
        <SummaryCard icon={Repeat} label="Systems" value={totalSystems} />
        <SummaryCard icon={ShieldOff} label="Anti-Goals" value={antiGoals.length} />
      </div>

      {/* Goals */}
      <div className="max-w-2xl mx-auto space-y-3 mt-8">
        <h3 className="font-display text-xl font-medium">Your Goals</h3>
        {goals.map((goal) => {
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: catInfo?.color }}
              />
              <CardContent className="py-4 pl-5">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: catInfo?.color, color: catInfo?.color }}
                  >
                    {catInfo?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {goal.type}
                  </Badge>
                </div>
                <p className="font-medium">{goal.title}</p>
                {goal.description && (
                  <div 
                    className="text-sm text-muted-foreground mt-0.5 prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: goal.description }}
                  />
                )}
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{goal.checkpoints.length} checkpoints</span>
                  <span>{goal.systems.length} systems</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Anti-Goals */}
      {antiGoals.filter((a) => a.description.trim()).length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="font-display text-xl font-medium">
            Boundaries (Anti-Goals)
          </h3>
          <ul className="space-y-1 text-sm">
            {antiGoals
              .filter((a) => a.description.trim())
              .map((a) => (
                <li key={a.id} className="flex items-start gap-2">
                  <ShieldOff className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{a.description}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-4 max-w-2xl mx-auto">
        <Button variant="ghost" onClick={prevStep} disabled={isSubmitting}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          size="lg"
          onClick={handleActivate}
          disabled={isSubmitting}
          className="px-10"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" /> Activate My Plan
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <Icon className="h-5 w-5 mx-auto mb-1 text-accent" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
