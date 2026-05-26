"use client"

import { useMemo } from "react"
import { MonthlyMonthBar, useActiveMonthFromUrl } from "@/components/check-in/monthly-month-bar"
import { MonthlyPlanForm } from "@/components/check-in/monthly-plan-form"
import { MonthlyReviewForm } from "@/components/check-in/monthly-review-form"
import { CadenceWorkspace } from "@/components/rhythm/cadence-workspace"
import { MonthlyHistoryRow } from "@/components/rhythm/monthly-history-row"
import { cadencePlanHasContent } from "@/lib/cadence-plan-utils"
import type { ReviewTemplateField } from "@/lib/review-templates"
import type { GoalStatus } from "@prisma/client"

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

interface PlanRow {
  month: number
  year: number
  monthFocus: string | null
  projectIntentions: unknown
  topIntentions: unknown
}

import type { QuarterlyFocusContext } from "@/lib/queries/rhythm-context"

/**
 * Client orchestrator for monthly plan + review. Requires parent `<Suspense>`.
 */
export function MonthlyWorkspace({
  data,
  plans,
  templateFields,
  quarterlyContext,
  initialMonth,
}: {
  data: {
    plan: { id: string; year: number }
    projects: {
      id: string
      title: string
      category: string
      status: GoalStatus
    }[]
    reviews: ReviewRow[]
  }
  plans: PlanRow[]
  templateFields: ReviewTemplateField[]
  quarterlyContext?: QuarterlyFocusContext | null
  initialMonth?: number
}) {
  const activeMonth = useActiveMonthFromUrl(initialMonth)

  const reviewedMonths = useMemo(
    () => new Set(data.reviews.map((r) => r.month)),
    [data.reviews],
  )

  const plannedMonths = useMemo(
    () =>
      new Set(
        plans
          .filter((p) =>
            cadencePlanHasContent({
              monthFocus: p.monthFocus,
              projectIntentions: p.projectIntentions,
              topIntentions: p.topIntentions,
            }),
          )
          .map((p) => p.month),
      ),
    [plans],
  )

  return (
    <CadenceWorkspace
      cadence="monthly"
      tabContext={{
        month: activeMonth,
        year: data.plan.year,
        hasPlan: plannedMonths.has(activeMonth),
        hasReview: reviewedMonths.has(activeMonth),
      }}
      periodBar={
        <div className="space-y-4">
          <MonthlyHistoryRow reviews={data.reviews} activeMonth={activeMonth} />
          <MonthlyMonthBar
            activeMonth={activeMonth}
            reviewedMonths={reviewedMonths}
            plannedMonths={plannedMonths}
          />
        </div>
      }
      planTab={
        <MonthlyPlanForm
          activeMonth={activeMonth}
          data={data}
          plans={plans}
          quarterlyContext={quarterlyContext}
        />
      }
      reviewTab={
        <MonthlyReviewForm
          data={data}
          templateFields={templateFields}
          quarterlyContext={quarterlyContext}
          activeMonth={activeMonth}
          hideMonthBar
        />
      }
    />
  )
}
