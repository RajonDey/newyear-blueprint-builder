"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import { ReviewTemplateEditor } from "@/components/check-in/review-template-editor"
import {
  mergeMonthlyResponses,
  pickResponsesForTemplate,
  type ReviewTemplateField,
} from "@/lib/review-templates"
import {
  AlertTriangle,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { MONTH_OPTIONS } from "@/lib/months"
import { QuarterlyFocusPanel } from "@/components/check-in/quarterly-focus-panel"
import type { QuarterlyFocusContext } from "@/lib/queries/rhythm-context"
import type { GoalStatus } from "@prisma/client"
import { MonthlyProjectStatusRow } from "@/components/check-in/monthly-project-status-row"

interface ReviewRow {
  month: number
  year: number
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  nextMonthFocus: string | null
  responses: unknown
  completedAt: Date | string
}

interface FormData {
  plan: { id: string; year: number }
  projects: { id: string; title: string; category: string; status: GoalStatus }[]
  reviews: ReviewRow[]
}

type QuarterlyContext = QuarterlyFocusContext

function iconForFieldKey(key: string) {
  const k = key.toLowerCase()
  if (k.includes("win")) return Trophy
  if (k.includes("challenge")) return AlertTriangle
  if (k.includes("adjust")) return RefreshCw
  return FileText
}

function buildMonthStates(
  reviews: ReviewRow[],
  templateFields: ReviewTemplateField[],
): Record<number, Record<string, string>> {
  const init: Record<number, Record<string, string>> = {}
  for (const m of MONTH_OPTIONS) {
    const r = reviews.find((x) => x.month === m.value)
    const merged = r
      ? mergeMonthlyResponses({
          responses: r.responses,
          summary: r.summary,
          winsText: r.winsText,
          challengesText: r.challengesText,
          adjustments: r.adjustments,
        })
      : {}
    init[m.value] = pickResponsesForTemplate(templateFields, merged)
  }
  return init
}

export function MonthlyReviewForm({
  data,
  templateFields,
  quarterlyContext,
  initialMonth,
  activeMonth: controlledMonth,
  hideMonthBar = false,
}: {
  data: FormData
  templateFields: ReviewTemplateField[]
  quarterlyContext?: QuarterlyContext | null
  initialMonth?: number
  /** When set, month picker is owned by MonthlyWorkspace. */
  activeMonth?: number
  hideMonthBar?: boolean
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const currentJsMonth = new Date().getMonth() + 1
  const [internalMonth, setInternalMonth] = useState(() => {
    if (initialMonth != null && initialMonth >= 1 && initialMonth <= 12) {
      return initialMonth
    }
    return currentJsMonth
  })

  const activeMonth =
    controlledMonth != null && controlledMonth >= 1 && controlledMonth <= 12
      ? controlledMonth
      : internalMonth

  const reviewedMonths = new Set(data.reviews.map((r) => r.month))

  const [formState, setFormState] = useState<
    Record<number, Record<string, string>>
  >(() => buildMonthStates(data.reviews, templateFields))

  useEffect(() => {
    setFormState(buildMonthStates(data.reviews, templateFields))
  }, [data.reviews, templateFields])

  const [nextMonthFocusByMonth, setNextMonthFocusByMonth] = useState<
    Record<number, string>
  >(() => {
    const init: Record<number, string> = {}
    for (const r of data.reviews) {
      init[r.month] = r.nextMonthFocus ?? ""
    }
    return init
  })

  useEffect(() => {
    const init: Record<number, string> = {}
    for (const r of data.reviews) {
      init[r.month] = r.nextMonthFocus ?? ""
    }
    setNextMonthFocusByMonth(init)
  }, [data.reviews])

  async function handleSubmit(month: number) {
    const state = formState[month]
    if (!state) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          month,
          year: data.plan.year,
          responses: state,
          nextMonthFocus: nextMonthFocusByMonth[month]?.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      router.refresh()
    } catch {
      toast.error("Failed to save")
    } finally {
      setSubmitting(false)
    }
  }

  if (data.projects.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Monthly reviews live here"
        description="Create projects first, then come back each month to reflect on what worked, what didn't, and what to adjust."
        action={
          <Button asChild>
            <a href="/onboarding">
              <Sparkles className="mr-2 h-4 w-4" /> Create your plan (~15 min)
            </a>
          </Button>
        }
      />
    )
  }

  const activeMonthData = MONTH_OPTIONS.find((m) => m.value === activeMonth)!
  const state = formState[activeMonth]
  const existing = data.reviews.find((r) => r.month === activeMonth)

  return (
    <div className="space-y-6">
      <ReviewTemplateEditor cadence="MONTHLY" fields={templateFields} />

      {quarterlyContext && <QuarterlyFocusPanel context={quarterlyContext} />}

      <MonthlyProjectStatusRow projects={data.projects} />

      {!hideMonthBar && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{reviewedMonths.size} of 12 months reviewed</span>
              <span className="tabular-nums font-medium">
                {Math.round((reviewedMonths.size / 12) * 100)}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full bg-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={reviewedMonths.size}
              aria-valuemin={0}
              aria-valuemax={12}
            >
              <div
                className="h-full rounded-full bg-status-positive transition-all duration-500"
                style={{ width: `${(reviewedMonths.size / 12) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {MONTH_OPTIONS.map((m) => {
              const isActive = m.value === activeMonth
              const isReviewed = reviewedMonths.has(m.value)
              const isCurrent = m.value === currentJsMonth
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setInternalMonth(m.value)}
                  className={cn(
                    "relative rounded-lg border px-2 py-2.5 text-center text-sm font-medium transition-colors",
                    isActive
                      ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent/40"
                      : "hover:bg-muted/50",
                    isReviewed &&
                      !isActive &&
                      "border-status-positive/40 bg-status-positive/15 text-foreground",
                    isCurrent && !isActive && !isReviewed && "border-accent/30",
                  )}
                >
                  {m.label}
                  {isReviewed && (
                    <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-status-positive" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 space-y-1">
          <h2 className="text-base font-display flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-accent" />
            {activeMonthData.full} {data.plan.year}
          </h2>
          {existing && (
            <p className="text-xs text-status-positive flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Reviewed on{" "}
              {new Date(existing.completedAt).toLocaleDateString()}
            </p>
          )}
        </header>
        <div className="px-4 py-4 space-y-5">
          {templateFields.map((field) => {
            const Icon = iconForFieldKey(field.key)
            const val = state[field.key] ?? ""
            return (
              <div key={field.key} className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-accent shrink-0" />
                  {field.label}
                </label>
                <RichTextEditor
                  value={val}
                  onChange={(next) =>
                    setFormState((prev) => ({
                      ...prev,
                      [activeMonth]: { ...prev[activeMonth], [field.key]: next },
                    }))
                  }
                  placeholder={
                    field.placeholder || `Reflect on ${field.label.toLowerCase()}…`
                  }
                  rows={field.key === "summary" ? 2 : 3}
                  className="bg-card"
                />
              </div>
            )
          })}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-accent shrink-0" />
              Carry into next month
            </label>
            <p className="text-xs text-muted-foreground">
              One focus line for the weeks ahead — this surfaces on your weekly
              planner.
            </p>
            <RichTextEditor
              value={nextMonthFocusByMonth[activeMonth] ?? ""}
              onChange={(next) =>
                setNextMonthFocusByMonth((prev) => ({
                  ...prev,
                  [activeMonth]: next,
                }))
              }
              placeholder="What should next month prioritize?"
              rows={2}
              className="bg-card"
            />
          </div>
          <Button
            type="button"
            onClick={() => handleSubmit(activeMonth)}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            Save {activeMonthData.full} review
          </Button>
        </div>
      </section>
    </div>
  )
}
