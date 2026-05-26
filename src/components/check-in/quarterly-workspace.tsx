"use client"

import { useMemo } from "react"
import {
  QuarterlyQuarterBar,
  useActiveQuarterFromUrl,
} from "@/components/check-in/quarterly-quarter-bar"
import { QuarterlyPlanForm } from "@/components/check-in/quarterly-plan-form"
import { QuarterlyReviewForm } from "@/components/check-in/quarterly-review-form"
import { CadenceWorkspace } from "@/components/rhythm/cadence-workspace"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"
import type { QuarterValue } from "@/lib/quarters"
import type { ReviewTemplateField } from "@/lib/review-templates"

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

interface PlanRow {
  quarter: string
  year: number
  quarterFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

/**
 * Client orchestrator for quarterly plan + review. Requires parent `<Suspense>`.
 */
export function QuarterlyWorkspace({
  data,
  plans,
  templateFields,
  initialQuarter,
}: {
  data: {
    plan: { id: string; year: number }
    projects: {
      id: string
      title: string
      category: string
      status: string
    }[]
    wheelScores: Record<string, number>
    reviews: QuarterlyReviewRow[]
    monthlyReviews: MonthlyReviewRow[]
  }
  plans: PlanRow[]
  templateFields: ReviewTemplateField[]
  initialQuarter?: QuarterValue
}) {
  const activeQuarter = useActiveQuarterFromUrl(initialQuarter)

  const reviewedQuarters = useMemo(
    () => new Set(data.reviews.map((r) => r.quarter)),
    [data.reviews],
  )

  const plannedQuarters = useMemo(
    () =>
      new Set(
        plans
          .filter((p) =>
            cadencePlanHasContent({
              quarterFocus: p.quarterFocus,
              projectIntentions: p.projectIntentions,
              topIntentions: p.topIntentions,
            }),
          )
          .map((p) => p.quarter),
      ),
    [plans],
  )

  return (
    <CadenceWorkspace
      cadence="quarterly"
      tabContext={{
        quarter: activeQuarter,
        year: data.plan.year,
        hasPlan: plannedQuarters.has(activeQuarter),
        hasReview: reviewedQuarters.has(activeQuarter),
      }}
      periodBar={
        <QuarterlyQuarterBar
          activeQuarter={activeQuarter}
          reviewedQuarters={reviewedQuarters}
          plannedQuarters={plannedQuarters}
        />
      }
      planTab={
        <QuarterlyPlanForm
          activeQuarter={activeQuarter}
          data={data}
          plans={plans}
        />
      }
      reviewTab={
        <QuarterlyReviewForm
          data={data}
          templateFields={templateFields}
          activeQuarter={activeQuarter}
          hideQuarterBar
        />
      }
    />
  )
}
