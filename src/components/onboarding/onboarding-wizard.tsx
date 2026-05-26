"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
} from "lucide-react"
import { toast } from "sonner"
import { LifeCategory } from "@prisma/client"
import { BrandMark } from "@/components/shared/brand-mark"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Onboarding wizard — conversion Letter family (§6, §7, §11).
 */

const EASE_OUT = [0.16, 1, 0.3, 1] as const

interface OnboardingWizardProps {
  initialName?: string
}

type LC = LifeCategory

const lifeCategories: { id: LC; label: string; hint: string }[] = [
  { id: "HEALTH", label: "Health", hint: "Energy, sleep, body, training base." },
  { id: "CAREER", label: "Career", hint: "Craft, contribution, trajectory." },
  { id: "FINANCE", label: "Finance", hint: "Runway, savings, calm with money." },
  { id: "RELATIONSHIPS", label: "Relationships", hint: "Presence with the people who matter." },
  { id: "SPIRITUALITY", label: "Spirituality", hint: "Stillness, meaning, alignment." },
  { id: "PASSION", label: "Passion", hint: "Play, curiosity, the side craft." },
]

const themeSuggestions = ["Momentum", "Foundations", "Depth", "Lightness", "Return", "Build"]
const stepLabels = ["You", "Wheel", "Keystone"] as const

type State = {
  name: string
  theme: string
  strongest: LC | null
  weakest: LC | null
  goalCategory: LC | null
  goalTitle: string
  systemTitle: string
}

export function OnboardingWizard({ initialName = "" }: OnboardingWizardProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [direction, setDirection] = useState(1)
  const [step, setStep] = useState(0)
  const [complete, setComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [s, setS] = useState<State>({
    name: initialName,
    theme: "",
    strongest: null,
    weakest: null,
    goalCategory: null,
    goalTitle: "",
    systemTitle: "",
  })

  const update = (patch: Partial<State>) => setS((prev) => ({ ...prev, ...patch }))

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return s.name.trim().length > 0 && s.theme.trim().length > 0
      case 1:
        return s.strongest !== null && s.weakest !== null && s.strongest !== s.weakest
      case 2:
        return (
          s.goalCategory !== null &&
          s.goalTitle.trim().length > 0 &&
          s.systemTitle.trim().length > 0
        )
      default:
        return true
    }
  }, [step, s])

  async function finish() {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name.trim(),
          theme: s.theme.trim(),
          strongest: s.strongest,
          weakest: s.weakest,
          goalCategory: s.goalCategory,
          goalTitle: s.goalTitle.trim(),
          systemTitle: s.systemTitle.trim(),
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        if (res.status === 401) {
          toast.error(body?.error || "Your session expired. Please sign in again.")
          router.replace("/login?error=SessionInvalid")
          setSubmitting(false)
          return
        }
        toast.error(body?.error || "Could not save. Try again.")
        setSubmitting(false)
        return
      }
      setComplete(true)
      setSubmitting(false)
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
      setSubmitting(false)
    }
  }

  const next = () => {
    if (!canAdvance) return
    if (step === stepLabels.length - 1) {
      void finish()
    } else {
      setDirection(1)
      setStep((n) => n + 1)
    }
  }

  const back = () => {
    setDirection(-1)
    setStep((n) => Math.max(0, n - 1))
  }

  const transition = {
    duration: reduceMotion ? 0.12 : 0.16,
    ease: EASE_OUT,
  }

  if (complete) {
    return (
      <div className="max-w-xl">
        <CompletionScreen onContinue={() => router.replace("/dashboard")} />
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground tabular-nums">
          Step {step + 1} of {stepLabels.length}
        </p>
        <p className="font-display text-sm text-muted-foreground">{stepLabels[step]}</p>
      </div>

      <div className="mb-10 flex gap-1.5">
        {stepLabels.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-short ease-out",
              i <= step ? "bg-amber" : "bg-border",
            )}
          />
        ))}
      </div>

      <div className="min-h-[320px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{
              opacity: 0,
              x: reduceMotion ? 0 : direction * 8,
            }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              opacity: 0,
              x: reduceMotion ? 0 : direction * -8,
            }}
            transition={transition}
          >
            {step === 0 && <StepYou s={s} update={update} />}
            {step === 1 && <StepWheel s={s} update={update} />}
            {step === 2 && <StepKeystone s={s} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0 || submitting}
          className="gap-1.5 px-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="button" onClick={next} disabled={!canAdvance || submitting} className="gap-1.5">
          {submitting
            ? "Saving…"
            : step === stepLabels.length - 1
              ? "Enter your year"
              : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Takes about 90 seconds. The rest fills in as you live the year.
      </p>
    </div>
  )
}

function CompletionScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col items-start gap-6">
        <BrandMark size="xl" />
        <div className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1]">
            Your year is live.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-md">
            Start with Today — everything else waits. Your starter plan, wheel,
            and first project are ready.
          </p>
        </div>
      </div>
      <Button size="lg" onClick={onContinue} className="gap-2">
        Open Today
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function StepYou({ s, update }: { s: State; update: (p: Partial<State>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-display italic text-lg text-muted-foreground">First,</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl tracking-tight leading-[1.1]">
          Let&apos;s start with you.
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          A name and a single word for the year. Nothing more.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-name">Your name</Label>
        <Input
          id="onboarding-name"
          autoFocus
          value={s.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="What should we call you?"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-theme">One word for this year</Label>
        <Input
          id="onboarding-theme"
          value={s.theme}
          onChange={(e) => update({ theme: e.target.value })}
          placeholder="If this year had a name…"
          className="h-11"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {themeSuggestions.map((t) => (
            <Button
              key={t}
              type="button"
              size="sm"
              variant={s.theme === t ? "secondary" : "outline"}
              onClick={() => update({ theme: t })}
              className={cn(
                "rounded-full h-8 px-3 text-xs",
                s.theme === t && "border-amber/40 bg-amber-tint text-foreground",
              )}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepWheel({ s, update }: { s: State; update: (p: Partial<State>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1]">
          Where are you, honestly?
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          These six areas match <span className="text-foreground">Areas</span> in
          Plan and the Wheel. Pick strongest and weakest — the rest fills in over
          the next few weeks.
        </p>
      </div>

      <CategoryPicker
        title="Strongest right now"
        icon={ArrowUp}
        selected={s.strongest}
        excluded={s.weakest}
        onSelect={(c) => update({ strongest: c })}
      />

      <CategoryPicker
        title="Weakest right now"
        icon={ArrowDown}
        selected={s.weakest}
        excluded={s.strongest}
        onSelect={(c) => update({ weakest: c })}
      />
    </div>
  )
}

function CategoryPicker({
  title,
  icon: Icon,
  selected,
  excluded,
  onSelect,
}: {
  title: string
  icon: typeof ArrowUp
  selected: LC | null
  excluded: LC | null
  onSelect: (c: LC) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-amber" aria-hidden />
        <Label>{title}</Label>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {lifeCategories.map((c) => {
          const isSelected = selected === c.id
          const isExcluded = excluded === c.id
          return (
            <Button
              key={c.id}
              type="button"
              variant="outline"
              disabled={isExcluded}
              onClick={() => onSelect(c.id)}
              className={cn(
                "h-auto w-full min-w-0 whitespace-normal flex-col items-start rounded-md px-3 py-2.5 text-left text-sm font-normal",
                isExcluded && "opacity-30 cursor-not-allowed",
                isSelected &&
                  "border-amber bg-amber-tint text-foreground hover:bg-amber-tint hover:text-foreground",
              )}
            >
              <div className="flex w-full min-w-0 items-center gap-2">
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-amber" />}
                <span className="font-medium">{c.label}</span>
              </div>
              <p className="mt-1 w-full min-w-0 text-xs text-muted-foreground font-normal leading-snug text-pretty line-clamp-2">
                {c.hint}
              </p>
            </Button>
          )
        })}
      </div>
    </div>
  )
}

function StepKeystone({ s, update }: { s: State; update: (p: Partial<State>) => void }) {
  const defaultCategory = s.goalCategory ?? s.weakest ?? lifeCategories[0].id

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1]">
          One project. One small daily move.
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Don&apos;t plan your whole year today. Pick the area this project lives
          in — we&apos;ll place it there automatically.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Area of life</Label>
        <p className="text-xs text-muted-foreground">
          Same domains as the Wheel and your <span className="text-foreground">Areas</span> list.
        </p>
        <div className="flex flex-wrap gap-2">
          {lifeCategories.map((c) => (
            <Button
              key={c.id}
              type="button"
              size="sm"
              variant={defaultCategory === c.id ? "secondary" : "outline"}
              onClick={() => update({ goalCategory: c.id })}
              className={cn(
                "rounded-full h-8 px-3 text-xs",
                defaultCategory === c.id && "border-amber/40 bg-amber-tint text-foreground",
              )}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-project">The project</Label>
        <Input
          id="onboarding-project"
          value={s.goalTitle}
          onChange={(e) =>
            update({ goalTitle: e.target.value, goalCategory: defaultCategory })
          }
          placeholder="e.g. Build a sustainable training base"
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-system">One small daily move</Label>
        <Input
          id="onboarding-system"
          value={s.systemTitle}
          onChange={(e) => update({ systemTitle: e.target.value })}
          placeholder="The smallest thing you'll do, most days"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground pt-1">
          Make it embarrassingly small. You can grow it later.
        </p>
      </div>
    </div>
  )
}
