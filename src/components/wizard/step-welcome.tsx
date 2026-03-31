"use client"

import { useWizardStore } from "@/stores/wizard-store"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Compass, Sparkles } from "lucide-react"

export function StepWelcome() {
  const { year, setYear, nextStep } = useWizardStore()
  const currentYear = new Date().getFullYear()
  const yearOptions = [currentYear, currentYear + 1]

  return (
    <div className="flex flex-col items-center text-center space-y-8 py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
        <Compass className="h-10 w-10 text-accent" />
      </div>

      <div className="space-y-3 max-w-lg">
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Begin Your Journey
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Every meaningful journey starts with a single step. Over the next few
          minutes, you&apos;ll reflect on your past, discover where you stand, and
          set intentions for a life worth living.
        </p>
        <p className="text-muted-foreground/90 text-sm max-w-md mx-auto leading-relaxed border border-border/60 rounded-lg bg-muted/30 px-4 py-3">
          Your answers save automatically in this browser—you can close anytime
          and resume where you left off.
        </p>
      </div>

      <OrnamentDivider variant="lotus" />

      <blockquote className="max-w-md italic text-muted-foreground border-l-2 border-accent pl-4 text-left">
        &ldquo;The secret of change is to focus all of your energy not on
        fighting the old, but on building the new.&rdquo;
        <footer className="mt-1 text-sm font-medium not-italic text-foreground/70">
          — Socrates
        </footer>
      </blockquote>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Which year are you planning for?
        </p>
        <div className="flex gap-3 justify-center">
          {yearOptions.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`relative rounded-lg border-2 px-8 py-4 text-lg font-semibold transition-all ${
                year === y
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50"
              }`}
            >
              {y}
              {year === y && (
                <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-accent" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" onClick={nextStep} className="mt-4 px-12">
        Begin Your Journey
      </Button>
    </div>
  )
}
