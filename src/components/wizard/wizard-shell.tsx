"use client"

import { useWizardStore, WIZARD_STEPS } from "@/stores/wizard-store"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"
import { StepWelcome } from "./step-welcome"
import { StepReflection } from "./step-reflection"
import { StepGoals } from "./step-goals"
import { StepPlan } from "./step-plan"
import { StepAntiGoals } from "./step-anti-goals"
import { StepReview } from "./step-review"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"

const STEP_COMPONENTS = [
  StepWelcome,
  StepReflection,
  StepGoals,
  StepPlan,
  StepAntiGoals,
  StepReview,
]

export function WizardShell() {
  const { currentStep } = useWizardStore()
  const safeStep = Math.min(Math.max(0, currentStep), STEP_COMPONENTS.length - 1)
  const StepComponent = STEP_COMPONENTS[safeStep]

  return (
    <div className="relative min-h-screen bg-background">
      <MandalaWatermark position="top-right" size="lg" />

      {/* Stepper */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <nav className="flex items-center justify-between gap-1 overflow-x-auto">
            {WIZARD_STEPS.map((step, index) => {
              const isCompleted = index < safeStep
              const isCurrent = index === safeStep
              return (
                <div key={step.id} className="flex items-center gap-1.5 shrink-0">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-accent text-white ring-2 ring-accent/30 ring-offset-2 ring-offset-background",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden text-xs font-medium sm:inline",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "hidden h-px w-6 sm:block",
                        isCompleted ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={safeStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
