"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { BookOpen, ArrowLeft, ArrowRight } from "lucide-react"

const PROMPTS = [
  {
    key: "wins" as const,
    title: "Celebrate Your Victories",
    prompt:
      "What were your biggest wins, breakthroughs, or moments of pride this past year?",
    placeholder:
      "The accomplishments, milestones, and moments that made you proud...",
  },
  {
    key: "challenges" as const,
    title: "Honor Your Struggles",
    prompt:
      "What challenges did you face? What was difficult, and how did you grow through it?",
    placeholder:
      "The obstacles you overcame, the lessons hidden in difficulty...",
  },
  {
    key: "gratitude" as const,
    title: "Practice Gratitude",
    prompt:
      "What are you most grateful for? Who or what made a meaningful difference?",
    placeholder:
      "The people, experiences, and gifts that enriched your journey...",
  },
  {
    key: "lessons" as const,
    title: "Carry Forward Wisdom",
    prompt:
      "What lessons will you carry into the new year? What do you know now that you didn\u2019t before?",
    placeholder:
      "The wisdom you\u2019ve earned, the insights that will guide your path...",
  },
]

export function StepReflection() {
  const { reflections, setReflections, nextStep, prevStep } = useWizardStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
          <BookOpen className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-3xl font-semibold">
          Honor Your Past Year
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Before you look ahead, take a moment to look back with kindness.
          There is no right or wrong here — just honesty.
        </p>
      </div>

      <OrnamentDivider variant="leaf" />

      <div className="space-y-8 max-w-2xl mx-auto">
        {PROMPTS.map((item) => (
          <div key={item.key} className="space-y-2">
            <h3 className="font-display text-xl font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.prompt}</p>
            <Textarea
              value={reflections[item.key]}
              onChange={(e) =>
                setReflections({ [item.key]: e.target.value })
              }
              placeholder={item.placeholder}
              rows={4}
              className="resize-none bg-card"
            />
          </div>
        ))}
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
