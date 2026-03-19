"use client"

import { useWizardStore, type WizardAntiGoal } from "@/stores/wizard-store"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { ArrowLeft, ArrowRight, ShieldOff, Plus, Trash2 } from "lucide-react"
import type { LifeCategory } from "@prisma/client"

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function StepAntiGoals() {
  const { antiGoals, addAntiGoal, updateAntiGoal, removeAntiGoal, nextStep, prevStep } =
    useWizardStore()

  function handleAdd() {
    addAntiGoal({ id: generateId(), description: "", category: null })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <ShieldOff className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">
          Set Your Boundaries
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Sometimes what you choose <em>not</em> to do is just as important as
          what you pursue. Define the habits, behaviors, and patterns you want
          to leave behind.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <blockquote className="max-w-md mx-auto italic text-muted-foreground border-l-2 border-accent pl-4">
        &ldquo;The impediment to action advances action. What stands in the
        way becomes the way.&rdquo;
        <footer className="mt-1 text-sm font-medium not-italic text-foreground/70">
          — Marcus Aurelius
        </footer>
      </blockquote>

      <div className="space-y-4 max-w-2xl mx-auto">
        {antiGoals.map((ag) => (
          <div key={ag.id} className="flex gap-2 items-start">
            <div className="flex-1 flex gap-2">
              <Input
                value={ag.description}
                onChange={(e) =>
                  updateAntiGoal(ag.id, { description: e.target.value })
                }
                placeholder="e.g., Stop checking phone first thing in the morning"
                className="flex-1 bg-card"
              />
              <select
                value={ag.category || ""}
                onChange={(e) =>
                  updateAntiGoal(ag.id, {
                    category: (e.target.value || null) as LifeCategory | null,
                  })
                }
                className="h-10 rounded-md border border-input bg-background px-2 text-sm w-36"
              >
                <option value="">No category</option>
                {LIFE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeAntiGoal(ag.id)}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {antiGoals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ShieldOff className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              No anti-goals yet. What do you want to stop doing?
            </p>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleAdd}
          className="w-full border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Anti-Goal
        </Button>
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
