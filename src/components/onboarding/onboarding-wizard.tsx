"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { LifeCategory } from "@prisma/client"
import { cn } from "@/lib/utils"

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
  const [step, setStep] = useState(0)
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
          toast.error(
            body?.error ||
              "Your session expired. Please sign in again.",
          )
          router.replace("/login?error=SessionInvalid")
          setSubmitting(false)
          return
        }
        toast.error(body?.error || "Could not save. Try again.")
        setSubmitting(false)
        return
      }
      toast.success("Start with Today — everything else waits.", {
        description: "Your starter plan is live.",
      })
      router.replace("/dashboard")
      router.refresh()
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
      setStep((n) => n + 1)
    }
  }
  const back = () => setStep((n) => Math.max(0, n - 1))

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber/15 text-amber">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-base">YearInReview</span>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          Step {step + 1} of {stepLabels.length}
        </div>
      </header>

      <div className="mb-10 flex gap-1.5">
        {stepLabels.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= step ? "bg-amber" : "bg-border",
            )}
          />
        ))}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {step === 0 && <StepYou s={s} update={update} />}
            {step === 1 && <StepWheel s={s} update={update} />}
            {step === 2 && <StepKeystone s={s} update={update} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0 || submitting}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={next}
          disabled={!canAdvance || submitting}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium transition-colors",
            canAdvance && !submitting
              ? "bg-amber text-amber-foreground hover:bg-amber/90"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {submitting
            ? "Saving…"
            : step === stepLabels.length - 1
              ? "Enter your year"
              : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Takes about 90 seconds. The rest fills in as you live the year.
      </p>
    </div>
  )
}

function StepYou({ s, update }: { s: State; update: (p: Partial<State>) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Let&apos;s start with you.
        </h1>
        <p className="mt-2 text-muted-foreground">
          A name and a single word for the year. Nothing more.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Your name
        </label>
        <input
          autoFocus
          value={s.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="What should we call you?"
          className="w-full rounded-md border border-border bg-background/50 px-3.5 py-3 text-base outline-none focus:border-amber/60"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          One word for this year
        </label>
        <input
          value={s.theme}
          onChange={(e) => update({ theme: e.target.value })}
          placeholder="If this year had a name…"
          className="w-full rounded-md border border-border bg-background/50 px-3.5 py-3 text-base outline-none focus:border-amber/60"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {themeSuggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update({ theme: t })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                s.theme === t
                  ? "border-amber bg-amber/15 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground hover:bg-muted/50",
              )}
            >
              {t}
            </button>
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
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          Where are you, honestly?
        </h1>
        <p className="mt-2 text-muted-foreground">
          These six life areas are the same domains as{" "}
          <span className="text-foreground">Areas</span> in Plan and the Wheel
          — same colors, same shape. Pick where you feel{" "}
          <span className="text-foreground">strongest</span> and where you feel{" "}
          <span className="text-foreground">weakest</span>. The rest fills in over the next few weeks.
        </p>
      </div>

      <CategoryPicker
        title="Strongest right now"
        selected={s.strongest}
        excluded={s.weakest}
        onSelect={(c) => update({ strongest: c })}
        accent="emerald"
      />

      <CategoryPicker
        title="Weakest right now"
        selected={s.weakest}
        excluded={s.strongest}
        onSelect={(c) => update({ weakest: c })}
        accent="amber"
      />
    </div>
  )
}

function CategoryPicker({
  title,
  selected,
  excluded,
  onSelect,
  accent,
}: {
  title: string
  selected: LC | null
  excluded: LC | null
  onSelect: (c: LC) => void
  accent: "emerald" | "amber"
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-wider text-muted-foreground">
        {title}
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {lifeCategories.map((c) => {
          const isSelected = selected === c.id
          const isExcluded = excluded === c.id
          return (
            <button
              key={c.id}
              type="button"
              disabled={isExcluded}
              onClick={() => onSelect(c.id)}
              className={cn(
                "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                isExcluded && "opacity-30 cursor-not-allowed",
                !isExcluded && !isSelected && "border-border bg-background/40 hover:bg-muted/50",
                isSelected && accent === "emerald" &&
                  "border-emerald-500/50 bg-emerald-500/10 text-foreground",
                isSelected && accent === "amber" &&
                  "border-amber bg-amber/15 text-foreground",
              )}
            >
              <div className="flex items-center gap-2">
                {isSelected && <Check className="h-3.5 w-3.5" />}
                <span className="font-medium">{c.label}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {c.hint}
              </p>
            </button>
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
        <h1 className="font-display text-3xl md:text-4xl tracking-tight">
          One project. One small daily move.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Don&apos;t plan your whole year today. Pick the Area this project
          lives in — we&apos;ll place it there automatically.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          Area of life
        </label>
        <p className="text-xs text-muted-foreground">
          Same domains as the Wheel and your{" "}
          <span className="text-foreground">Areas</span> list. Projects attach
          here.
        </p>
        <div className="flex flex-wrap gap-2">
          {lifeCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => update({ goalCategory: c.id })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                defaultCategory === c.id
                  ? "border-amber bg-amber/15 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground hover:bg-muted/50",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          The project
        </label>
        <input
          value={s.goalTitle}
          onChange={(e) =>
            update({ goalTitle: e.target.value, goalCategory: defaultCategory })
          }
          placeholder="e.g. Build a sustainable training base"
          className="w-full rounded-md border border-border bg-background/50 px-3.5 py-3 text-base outline-none focus:border-amber/60"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">
          One small daily move
        </label>
        <input
          value={s.systemTitle}
          onChange={(e) => update({ systemTitle: e.target.value })}
          placeholder="The smallest thing you'll do, most days"
          className="w-full rounded-md border border-border bg-background/50 px-3.5 py-3 text-base outline-none focus:border-amber/60"
        />
        <p className="text-xs text-muted-foreground pt-1">
          Make it embarrassingly small. You can grow it later.
        </p>
      </div>
    </div>
  )
}
