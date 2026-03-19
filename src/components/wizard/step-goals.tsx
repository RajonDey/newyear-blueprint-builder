"use client"

import { useState } from "react"
import { useWizardStore, type WizardGoal } from "@/stores/wizard-store"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Flame,
  Star,
} from "lucide-react"
import type { LifeCategory, GoalType } from "@prisma/client"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

const EMPTY_GOAL: Omit<WizardGoal, "id"> = {
  category: "HEALTH",
  type: "PRIMARY",
  title: "",
  description: "",
  whyText: "",
  consequenceText: "",
  checkpoints: [],
  systems: [],
}

export function StepGoals() {
  const { goals, wheelEntries, addGoal, updateGoal, removeGoal, nextStep, prevStep } =
    useWizardStore()
  const [error, setError] = useState("")

  const sorted = [...wheelEntries].sort((a, b) => a.rating - b.rating)
  const suggestedCategories = sorted.slice(0, 3).map((e) => e.category)

  function handleAddGoal() {
    const defaultCategory =
      suggestedCategories.find(
        (c) => !goals.some((g) => g.category === c)
      ) || "HEALTH"
    addGoal({ ...EMPTY_GOAL, id: generateId(), category: defaultCategory as LifeCategory })
  }

  function handleNext() {
    const incomplete = goals.find((g) => !g.title.trim())
    if (goals.length === 0) {
      setError("Please add at least one goal to continue.")
      return
    }
    if (incomplete) {
      setError("Every goal needs a title.")
      return
    }
    setError("")
    nextStep()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <Star className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">
          Set Your Intentions
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Based on your Wheel of Life, set meaningful goals for the areas that
          matter most. Quality over quantity — one powerful goal can change
          everything.
        </p>
      </div>

      {suggestedCategories.length > 0 && (
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Suggested focus areas
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {suggestedCategories.map((cat) => {
              const info = LIFE_CATEGORIES.find((c) => c.id === cat)
              return (
                <Badge
                  key={cat}
                  variant="outline"
                  className="gap-1"
                  style={{ borderColor: info?.color, color: info?.color }}
                >
                  {info && <info.icon className="h-3 w-3" />}
                  {info?.label}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      <OrnamentDivider variant="leaf" />

      <div className="space-y-6 max-w-2xl mx-auto">
        {goals.map((goal, index) => (
          <GoalEditor
            key={goal.id}
            goal={goal}
            index={index}
            onUpdate={(data) => updateGoal(goal.id, data)}
            onRemove={() => removeGoal(goal.id)}
          />
        ))}

        {goals.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No goals yet. Add your first intention below.</p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleAddGoal}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" /> Add a Goal
        </Button>

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={prevStep}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function GoalEditor({
  goal,
  index,
  onUpdate,
  onRemove,
}: {
  goal: WizardGoal
  index: number
  onUpdate: (data: Partial<WizardGoal>) => void
  onRemove: () => void
}) {
  const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)

  return (
    <Card className="relative overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: catInfo?.color }}
      />
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-lg font-medium">
            Goal {index + 1}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Life Area</label>
            <select
              value={goal.category}
              onChange={(e) =>
                onUpdate({ category: e.target.value as LifeCategory })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {LIFE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Priority</label>
            <div className="flex gap-2">
              {(["PRIMARY", "SECONDARY"] as GoalType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdate({ type })}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                    goal.type === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-input text-muted-foreground hover:border-accent/50"
                  }`}
                >
                  {type === "PRIMARY" ? (
                    <span className="flex items-center justify-center gap-1">
                      <Flame className="h-3.5 w-3.5" /> Primary
                    </span>
                  ) : (
                    "Secondary"
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            What do you want to achieve?
          </label>
          <Input
            value={goal.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g., Run a half marathon by October"
            className="bg-card"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Describe your vision <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            value={goal.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="What does success look like? Be specific..."
            rows={2}
            className="resize-none bg-card"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Why does this matter?</label>
            <Textarea
              value={goal.whyText}
              onChange={(e) => onUpdate({ whyText: e.target.value })}
              placeholder="The deep reason this goal is important to you..."
              rows={2}
              className="resize-none bg-card"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">What if you don&apos;t?</label>
            <Textarea
              value={goal.consequenceText}
              onChange={(e) => onUpdate({ consequenceText: e.target.value })}
              placeholder="What happens if you don't pursue this..."
              rows={2}
              className="resize-none bg-card"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
