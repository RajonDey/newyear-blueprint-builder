"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { EmptyState } from "@/components/shared/empty-state"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { ReviewTemplateEditor } from "@/components/check-in/review-template-editor"
import {
  mergeQuarterlyResponses,
  mergeMonthlyResponses,
  pickResponsesForTemplate,
  type ReviewTemplateField,
} from "@/lib/review-templates"
import {
  CadenceContextRichText,
} from "@/components/check-in/cadence-context-banner"
import {
  Activity,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Trophy,
  CheckCircle2,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { QuarterlyPastSeasons } from "@/components/rhythm/quarterly-past-seasons"
import {
  getCurrentQuarter,
  monthsInQuarter,
  MONTH_SHORT_LABELS,
} from "@/lib/queries/rhythm-context"
import { QUARTER_OPTIONS, type QuarterValue } from "@/lib/quarters"

const QUARTERS = QUARTER_OPTIONS

interface QuarterlyReviewRow {
  quarter: string
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  responses: unknown
}

interface MonthlyReviewRow {
  month: number
  year: number
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  responses: unknown
  completedAt: Date | string
}

interface FormData {
  plan: { id: string; year: number }
  projects: { id: string; title: string; category: string; status: string }[]
  wheelScores: Record<string, number>
  reviews: QuarterlyReviewRow[]
  monthlyReviews: MonthlyReviewRow[]
}

function monthlyReviewSnippet(review: MonthlyReviewRow): string | null {
  const merged = mergeMonthlyResponses(review)
  for (const key of ["summary", "winsText", "adjustments"]) {
    const v = merged[key]?.trim()
    if (v) return v
  }
  return null
}

function iconForFieldKey(key: string) {
  const k = key.toLowerCase()
  if (k.includes("win")) return Trophy
  if (k.includes("challenge")) return AlertTriangle
  if (k.includes("adjust")) return RefreshCw
  return FileText
}

function buildQuarterStates(
  reviews: QuarterlyReviewRow[],
  templateFields: ReviewTemplateField[],
): Record<string, Record<string, string>> {
  const init: Record<string, Record<string, string>> = {}
  for (const q of QUARTERS) {
    const r = reviews.find((x) => x.quarter === q.value)
    const merged = r
      ? mergeQuarterlyResponses({
          responses: r.responses,
          summary: r.summary,
          winsText: r.winsText,
          challengesText: r.challengesText,
          adjustments: r.adjustments,
        })
      : {}
    init[q.value] = pickResponsesForTemplate(templateFields, merged)
  }
  return init
}

export function QuarterlyReviewForm({
  data,
  templateFields,
  initialQuarter,
  activeQuarter: controlledQuarter,
  hideQuarterBar = false,
}: {
  data: FormData
  templateFields: ReviewTemplateField[]
  initialQuarter?: QuarterValue
  activeQuarter?: QuarterValue
  hideQuarterBar?: boolean
}) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [internalQuarter, setInternalQuarter] = useState<QuarterValue>(
    () => initialQuarter ?? getCurrentQuarter(),
  )

  const activeQuarter =
    controlledQuarter ??
    internalQuarter

  const reviewedQuarters = new Set(data.reviews.map((r) => r.quarter))

  const [formState, setFormState] = useState<
    Record<string, Record<string, string>>
  >(() => buildQuarterStates(data.reviews, templateFields))

  useEffect(() => {
    setFormState(buildQuarterStates(data.reviews, templateFields))
  }, [data.reviews, templateFields])

  async function handleSubmit(quarter: string) {
    const state = formState[quarter]
    if (!state) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/quarterly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: data.plan.id,
          quarter,
          responses: state,
          wheelOfLifeSnapshot: data.wheelScores,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast.success(`${quarter} review saved!`)
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
        icon={Activity}
        title="Add projects to start quarterly reviews"
        description="Quarterly reviews help you reflect on project health and adjust your plan. Create a project first."
        action={
          <Button asChild>
            <Link href="/projects">
              <Sparkles className="mr-2 h-4 w-4" /> Go to projects
            </Link>
          </Button>
        }
      />
    )
  }

  const currentQ = getCurrentQuarter()
  const activeQ = QUARTERS.find((q) => q.value === activeQuarter)!
  const state = formState[activeQuarter]
  const existing = data.reviews.find((r) => r.quarter === activeQuarter)
  const reviewedMonths = new Set(data.monthlyReviews.map((r) => r.month))
  const quarterMonths = monthsInQuarter(activeQuarter)

  return (
    <div className="space-y-6">
      <ReviewTemplateEditor cadence="QUARTERLY" fields={templateFields} />

      {!hideQuarterBar && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {QUARTERS.map((q) => {
            const isActive = q.value === activeQuarter
            const isReviewed = reviewedQuarters.has(q.value)
            const isCurrent = q.value === currentQ
            return (
              <button
                key={q.value}
                type="button"
                onClick={() => setInternalQuarter(q.value)}
                className={cn(
                  "relative rounded-lg border px-2 py-3 text-center transition-colors",
                  isActive
                    ? "border-accent bg-accent/10 text-foreground"
                    : "hover:bg-muted/50",
                  isCurrent && !isActive && "border-accent/30",
                )}
              >
                <span className="text-sm font-medium">{q.label}</span>
                <span className="block text-xs text-muted-foreground">{q.months}</span>
                {isReviewed && (
                  <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-emerald-500" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {quarterMonths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Monthly reviews in {activeQ.label}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quarterMonths.map((month) => {
              const isReviewed = reviewedMonths.has(month)
              const label = MONTH_SHORT_LABELS[month - 1] ?? `M${month}`
              return (
                <Link
                  key={month}
                  href={`/rhythm/monthly?month=${month}`}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center text-sm transition-colors hover:bg-muted/50",
                    isReviewed
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-dashed border-border/80",
                  )}
                >
                  <span className="font-medium">{label}</span>
                  {isReviewed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground">Not reviewed</span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {quarterMonths.some((month) =>
        data.monthlyReviews.some((r) => r.month === month),
      ) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What happened each month
          </p>
          <div className="space-y-2">
            {quarterMonths.map((month) => {
              const review = data.monthlyReviews.find((r) => r.month === month)
              if (!review) return null
              const snippet = monthlyReviewSnippet(review)
              const label = MONTH_SHORT_LABELS[month - 1] ?? `Month ${month}`
              return (
                <details
                  key={month}
                  className="group rounded-lg border border-border bg-card overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors">
                    <span>{label} {data.plan.year}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Reviewed{" "}
                      {new Date(review.completedAt).toLocaleDateString()}
                    </span>
                  </summary>
                  <div className="border-t border-border px-4 py-3">
                    {snippet ? (
                      <CadenceContextRichText html={snippet} />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No summary saved for this month.
                      </p>
                    )}
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-full">
          {data.projects.map((g) => {
            const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
            const statusColor =
              g.status === "COMPLETED"
                ? "text-emerald-600 dark:text-emerald-400"
                : g.status === "AT_RISK"
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
            return (
              <div
                key={g.id}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              >
                {cat && <cat.icon className="h-3 w-3" style={{ color: cat.color }} />}
                <span className="font-medium">{g.title}</span>
                <span className={cn("capitalize", statusColor)}>
                  {g.status.toLowerCase().replace("_", " ")}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            {activeQ.label} — {activeQ.months}
          </CardTitle>
          {existing && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Trophy className="h-3 w-3" /> Review saved
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
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
                      [activeQuarter]: { ...prev[activeQuarter], [field.key]: next },
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
          <Button
            type="button"
            onClick={() => handleSubmit(activeQuarter)}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trophy className="mr-2 h-4 w-4" />
            )}
            Save {activeQ.label} review
          </Button>
        </CardContent>
      </Card>

      <QuarterlyPastSeasons
        year={data.plan.year}
        reviews={data.reviews}
        activeQuarter={activeQuarter}
      />
    </div>
  )
}
