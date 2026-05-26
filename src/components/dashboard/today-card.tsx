"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Battery,
  Check,
  Heart,
  Pencil,
  Shield,
  Sun,
} from "lucide-react"
import type { AntiGoal, DailyState } from "@prisma/client"
import { Eyebrow } from "@/components/atmosphere/eyebrow"
import {
  resolveAntiGoalHeldForPill,
  resolveReflectionText,
  type AntiGoalHeldChoice,
} from "@/lib/daily-state/anti-goal-held"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { cn } from "@/lib/utils"
import { WeeklyPriorityChips } from "@/components/dashboard/weekly-priority-chips"
import type { WeeklyPriorityProject } from "@/lib/queries/weekly-priorities"

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY"

interface TodaySystem {
  id: string
  description: string
  frequency: Frequency
  goal: { id: string; title: string; category: string }
  isCompleted: boolean
}

interface TodayCardProps {
  systems: TodaySystem[]
  /** YYYY-MM-DD in the user's timezone — used for system completion + DailyState writes. */
  todayYmd: string
  planYear: number
  /** Optional one-word theme from YearlyPlan reflections. */
  planTheme?: string | null
  /** Today's prompt (deterministic by day-of-year). */
  prompt: { index: number; text: string }
  /** Existing DailyState row, or null if untouched today. */
  initialState: DailyState | null
  /** One rotating anti-goal pill, or null if the user has none. */
  rotatingAntiGoal: AntiGoal | null
  /** When &gt; 0, show link to full anti-goals workspace. */
  antiGoalCount?: number
  /** Up to three projects from this week's plan — surfaced as chips. */
  weeklyPriorityProjects?: WeeklyPriorityProject[]
  currentWeekNumber?: number
}

const FREQUENCY_LABEL: Record<Frequency, string> = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
}

/**
 * Editorial "Today" card on the dashboard home.
 *
 * Phase 6 adds DailyState depth on top of the Phase 1 systems checklist:
 *   - Today's prompt + reflection textarea (debounced autosave)
 *   - Mood 1–5 + Energy 1–5 pills (instant save)
 *   - "Held the line?" pill on a single rotating anti-goal (instant save)
 *
 * All DailyState fields go through `/api/today` PATCH which upserts on
 * `(userId, date)`. Mood/energy/anti-goal use immediate writes; reflection
 * debounces by 700ms. Anti-goal held/slipped uses `antiGoalHeldId` +
 * `antiGoalHeld` columns (PC-09).
 */
export function TodayCard({
  systems,
  todayYmd,
  planYear,
  planTheme,
  prompt,
  initialState,
  rotatingAntiGoal,
  antiGoalCount = 0,
  weeklyPriorityProjects = [],
  currentWeekNumber,
}: TodayCardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  // Systems checklist state (unchanged from Phase 1)
  const [pending, setPending] = useState<Set<string>>(new Set())
  const [optimistic, setOptimistic] = useState<Map<string, boolean>>(new Map())
  const [error, setError] = useState<string | null>(null)

  const resolvedSystems = useMemo(
    () =>
      systems.map((s) => ({
        ...s,
        isCompleted: optimistic.has(s.id)
          ? optimistic.get(s.id)!
          : s.isCompleted,
      })),
    [systems, optimistic],
  )

  const total = resolvedSystems.length
  const completed = resolvedSystems.filter((s) => s.isCompleted).length
  const completionPct =
    total === 0 ? 0 : Math.round((completed / total) * 100)

  async function toggleSystem(system: TodaySystem) {
    if (pending.has(system.id)) return
    const next = !system.isCompleted
    setError(null)
    setPending((p) => new Set(p).add(system.id))
    setOptimistic((m) => new Map(m).set(system.id, next))

    try {
      const res = await fetch("/api/systems/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId: system.id,
          date: todayYmd,
          completed: next,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      startTransition(() => router.refresh())
    } catch {
      setOptimistic((m) => {
        const copy = new Map(m)
        copy.delete(system.id)
        return copy
      })
      setError("Couldn't save that — try again in a moment.")
    } finally {
      setPending((p) => {
        const copy = new Set(p)
        copy.delete(system.id)
        return copy
      })
    }
  }

  return (
    <section
      id="today"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border/70 px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <Eyebrow className="flex items-center gap-1.5 mb-1.5">
            <Sun className="h-3 w-3" />
            Today
            {planTheme ? (
              <span className="normal-case tracking-normal text-muted-foreground/80 font-normal">
                · {planTheme}
              </span>
            ) : null}
          </Eyebrow>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug">
            {total === 0
              ? "A calm minute with yourself"
              : completed === total
                ? "All done — that's the long arc."
                : "Small reps, kept."}
          </h2>
        </div>
        {total > 0 && (
          <div className="text-right shrink-0">
            <div className="font-display text-3xl md:text-4xl tabular-nums leading-none">
              {completionPct}
              <span className="text-base text-muted-foreground">%</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {completed} of {total} today
            </div>
          </div>
        )}
      </header>

      {weeklyPriorityProjects.length > 0 && currentWeekNumber != null && (
        <WeeklyPriorityChips
          projects={weeklyPriorityProjects}
          weekNumber={currentWeekNumber}
        />
      )}

      <DailyStateBlock
        todayYmd={todayYmd}
        prompt={prompt}
        initialState={initialState}
        rotatingAntiGoal={rotatingAntiGoal}
        antiGoalCount={antiGoalCount}
      />

      <div className="border-t border-border/70 px-4 py-4 sm:px-6 sm:py-5">
        {total === 0 ? (
          <EmptyToday planYear={planYear} />
        ) : (
          <ul className="space-y-2">
            {resolvedSystems.map((s) => (
              <TodaySystemRow
                key={s.id}
                system={s}
                isPending={pending.has(s.id)}
                onToggle={() => toggleSystem(s)}
              />
            ))}
          </ul>
        )}

        {error && (
          <p className="mt-3 text-xs text-destructive" role="status">
            {error}
          </p>
        )}

        {total > 0 && (
          <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
            <Link
              href="/systems"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Pencil className="h-3 w-3" />
              Manage systems
            </Link>
            <Link
              href="/rhythm/weekly"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              This week
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  Daily state — prompt · reflection · mood · energy · anti-goal     */
/* ────────────────────────────────────────────────────────────────── */

function DailyStateBlock({
  todayYmd,
  prompt,
  initialState,
  rotatingAntiGoal,
  antiGoalCount,
}: {
  todayYmd: string
  prompt: { index: number; text: string }
  initialState: DailyState | null
  rotatingAntiGoal: AntiGoal | null
  antiGoalCount: number
}) {
  const initialReflection = resolveReflectionText(initialState?.reflection)
  const initialAntiHeld = resolveAntiGoalHeldForPill({
    rotatingAntiGoalId: rotatingAntiGoal?.id ?? null,
    antiGoalHeldId: initialState?.antiGoalHeldId,
    antiGoalHeld: initialState?.antiGoalHeld,
    reflection: initialState?.reflection,
  })

  const [mood, setMood] = useState<number | null>(initialState?.mood ?? null)
  const [energy, setEnergy] = useState<number | null>(
    initialState?.energy ?? null,
  )
  const [reflection, setReflection] = useState(initialReflection)
  const [antiHeld, setAntiHeld] = useState<AntiGoalHeldChoice | null>(
    initialAntiHeld,
  )
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedTextRef = useRef(initialReflection)

  async function patch(payload: Record<string, unknown>) {
    setSaveState("saving")
    try {
      const res = await fetch("/api/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayYmd, ...payload }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaveState("saved")
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 1500)
    } catch {
      setSaveState("error")
    }
  }

  async function saveMood(next: number | null) {
    setMood(next)
    await patch({ mood: next })
  }

  async function saveEnergy(next: number | null) {
    setEnergy(next)
    await patch({ energy: next })
  }

  async function saveAntiHeld(next: AntiGoalHeldChoice | null) {
    if (!rotatingAntiGoal) return
    setAntiHeld(next)
    await patch({
      antiGoalHeldId: next ? rotatingAntiGoal.id : null,
      antiGoalHeld: next === "held" ? true : next === "slipped" ? false : null,
    })
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  function onReflectionChange(next: string) {
    setReflection(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (next === lastSavedTextRef.current) return
      lastSavedTextRef.current = next
      await patch({ reflection: next.length > 0 ? next : null })
    }, 700)
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-5 space-y-4">
      <div>
        <Eyebrow className="mb-1.5">Today&apos;s prompt</Eyebrow>
        <p className="font-display text-base md:text-lg italic text-foreground/85 leading-relaxed">
          &ldquo;{prompt.text}&rdquo;
        </p>
      </div>

      <textarea
        value={reflection}
        onChange={(e) => onReflectionChange(e.target.value)}
        placeholder="Write a few words. Or don't."
        rows={3}
        className="w-full resize-none rounded-lg border border-dashed border-border/60 bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 focus:border-amber/40 transition-colors"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ScalePicker
          label="Mood"
          icon={<Heart className="h-3.5 w-3.5 text-rose-400" />}
          value={mood}
          onChange={saveMood}
        />
        <ScalePicker
          label="Energy"
          icon={<Battery className="h-3.5 w-3.5 text-emerald-500" />}
          value={energy}
          onChange={saveEnergy}
        />
      </div>

      {rotatingAntiGoal && (
        <div className="space-y-2">
          <div className="flex flex-col gap-3 rounded-lg border border-amber/30 bg-amber/[0.04] px-3 py-3 sm:flex-row sm:items-center sm:py-2.5">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <Shield className="h-3.5 w-3.5 text-amber shrink-0 mt-0.5" />
              <span className="text-xs text-foreground/85">
                <span className="text-[10px] uppercase tracking-widest text-amber mr-1.5">
                  Focus guardrail
                </span>
                {rotatingAntiGoal.description}
              </span>
            </div>
            <div className="inline-flex w-full rounded-md border border-border bg-background p-0.5 sm:w-auto shrink-0">
              <PillBtn
                active={antiHeld === "held"}
                onClick={() => saveAntiHeld(antiHeld === "held" ? null : "held")}
              >
                Held
              </PillBtn>
              <PillBtn
                active={antiHeld === "slipped"}
                onClick={() =>
                  saveAntiHeld(antiHeld === "slipped" ? null : "slipped")
                }
              >
                Slipped
              </PillBtn>
            </div>
          </div>
          {antiGoalCount > 0 && (
            <div className="flex justify-end">
              <Link
                href="/anti-goals"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Manage all anti-goals
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      )}

      {!rotatingAntiGoal && antiGoalCount === 0 && (
        <p className="text-xs text-muted-foreground">
          <Link
            href="/anti-goals"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Set focus guardrails for the year
            <ArrowRight className="h-3 w-3" />
          </Link>
        </p>
      )}

      <div className="flex items-center justify-end text-[10px] text-muted-foreground h-3">
        {saveState === "saving" && <span>Saving…</span>}
        {saveState === "saved" && <span className="text-emerald-600">Saved</span>}
        {saveState === "error" && (
          <span className="text-rose-500">Couldn&apos;t save — check connection</span>
        )}
      </div>
    </div>
  )
}

function ScalePicker({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="inline-flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? null : n)}
            className={cn(
              "h-11 w-11 rounded-full border text-sm font-medium transition-colors tabular-nums",
              value === n
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
            )}
            aria-pressed={value === n}
            aria-label={`${label} ${n} of 5`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded px-3 py-2 text-xs font-medium transition-colors",
        active
          ? "bg-amber text-background"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*  Systems checklist (Phase 1 — unchanged)                           */
/* ────────────────────────────────────────────────────────────────── */

function TodaySystemRow({
  system,
  isPending,
  onToggle,
}: {
  system: TodaySystem & { isCompleted: boolean }
  isPending: boolean
  onToggle: () => void
}) {
  const category = LIFE_CATEGORIES.find((c) => c.id === system.goal.category)
  const done = system.isCompleted

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={isPending}
        aria-pressed={done}
        className={cn(
          "group flex w-full min-h-11 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors sm:py-2.5",
          done
            ? "border-amber/30 bg-amber/5"
            : "border-border bg-background/60 hover:bg-muted/40",
          isPending && "opacity-60 pointer-events-none",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-5 sm:w-5",
            done
              ? "border-amber bg-amber text-amber-foreground"
              : "border-muted-foreground/40 group-hover:border-foreground/60",
          )}
        >
          {done && <Check className="h-3 w-3" />}
        </span>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "text-sm",
              done && "line-through decoration-muted-foreground/50",
            )}
          >
            {system.description}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            {category && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: category.color }}
                />
                {system.goal.title}
              </span>
            )}
            <span className="opacity-50">·</span>
            <span>{FREQUENCY_LABEL[system.frequency]}</span>
          </div>
        </div>
      </button>
    </li>
  )
}

function EmptyToday({ planYear: _planYear }: { planYear: number }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-6 text-center">
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        No systems on this plan yet. Daily systems are the small reps that
        compound — habits attached to a project, kept calmly.
      </p>
      <Link
        href="/systems"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-amber hover:underline"
      >
        Add your first system
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
