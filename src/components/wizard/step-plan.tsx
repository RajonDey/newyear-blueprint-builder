"use client"

import { useWizardStore, type WizardCheckpoint, type WizardSystem } from "@/stores/wizard-store"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import {
  ArrowLeft,
  ArrowRight,
  Map,
  Plus,
  Trash2,
  Calendar,
  Repeat,
} from "lucide-react"
import type { Quarter, Frequency } from "@prisma/client"

const QUARTERS: { value: Quarter; label: string; months: string }[] = [
  { value: "Q1", label: "Q1", months: "Jan – Mar" },
  { value: "Q2", label: "Q2", months: "Apr – Jun" },
  { value: "Q3", label: "Q3", months: "Jul – Sep" },
  { value: "Q4", label: "Q4", months: "Oct – Dec" },
]

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
]

export function StepPlan() {
  const { goals, updateGoal, nextStep, prevStep } = useWizardStore()

  if (goals.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">
          You haven&apos;t set any goals yet. Go back and add at least one.
        </p>
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Map className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">Chart the Path</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Break each goal into quarterly checkpoints, then define the daily and
          weekly systems that will carry you there.
        </p>
      </div>

      <OrnamentDivider variant="wheat" />

      <div className="space-y-10 max-w-2xl mx-auto">
        {goals.map((goal) => {
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: catInfo?.color }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{ borderColor: catInfo?.color, color: catInfo?.color }}
                  >
                    {catInfo?.label}
                  </Badge>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quarterly Checkpoints */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <h4 className="text-sm font-semibold">
                      Quarterly Checkpoints
                    </h4>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {QUARTERS.map((q) => {
                      const existing = goal.checkpoints.find(
                        (cp) => cp.quarter === q.value
                      )
                      return (
                        <div
                          key={q.value}
                          className="space-y-1 rounded-lg border p-3 bg-card"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-accent">
                              {q.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {q.months}
                            </span>
                          </div>
                          <Input
                            value={existing?.title || ""}
                            onChange={(e) => {
                              const updated = goal.checkpoints.filter(
                                (cp) => cp.quarter !== q.value
                              )
                              if (e.target.value.trim()) {
                                updated.push({
                                  quarter: q.value,
                                  title: e.target.value,
                                  description: existing?.description || "",
                                })
                              }
                              updateGoal(goal.id, { checkpoints: updated })
                            }}
                            placeholder={`What will you accomplish by end of ${q.label}?`}
                            className="h-8 text-sm bg-background"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Daily Habits */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-accent" />
                    <h4 className="text-sm font-semibold">
                      Daily &amp; Weekly Systems
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    What consistent actions will move you toward this goal?
                  </p>
                  <div className="space-y-2">
                    {goal.systems.map((sys, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={sys.description}
                          onChange={(e) => {
                            const updated = [...goal.systems]
                            updated[idx] = { ...sys, description: e.target.value }
                            updateGoal(goal.id, { systems: updated })
                          }}
                          placeholder="e.g., Run for 30 minutes"
                          className="flex-1 h-9 text-sm bg-background"
                        />
                        <select
                          value={sys.frequency}
                          onChange={(e) => {
                            const updated = [...goal.systems]
                            updated[idx] = {
                              ...sys,
                              frequency: e.target.value as Frequency,
                            }
                            updateGoal(goal.id, { systems: updated })
                          }}
                          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        >
                          {FREQUENCIES.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => {
                            updateGoal(goal.id, {
                              systems: goal.systems.filter((_, i) => i !== idx),
                            })
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateGoal(goal.id, {
                          systems: [
                            ...goal.systems,
                            { description: "", frequency: "DAILY" as Frequency },
                          ],
                        })
                      }
                      className="border-dashed"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add System
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={nextStep}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
