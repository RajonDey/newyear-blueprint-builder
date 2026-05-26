import type { Quarter } from "@prisma/client"
import {
  mergeMonthlyResponses,
  mergeQuarterlyResponses,
} from "@/lib/review-templates"
import { parseTopIntentions } from "@/types/monthly"

export const MONTH_SHORT_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export function getCurrentQuarter(): Quarter {
  const m = new Date().getMonth()
  if (m < 3) return "Q1"
  if (m < 6) return "Q2"
  if (m < 9) return "Q3"
  return "Q4"
}

export function monthsInQuarter(quarter: Quarter | string): number[] {
  switch (quarter) {
    case "Q1":
      return [1, 2, 3]
    case "Q2":
      return [4, 5, 6]
    case "Q3":
      return [7, 8, 9]
    case "Q4":
      return [10, 11, 12]
    default:
      return []
  }
}

type ReviewTextRow = {
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
  responses: unknown
  nextMonthFocus?: string | null
}

function pickFocusFromMerged(merged: Record<string, string>): string | null {
  for (const key of ["adjustments", "summary"]) {
    const raw = merged[key]?.trim()
    if (raw) return raw
  }
  return null
}

export function pickMonthlyFocusText(row: ReviewTextRow | null): string | null {
  if (!row) return null
  if (row.nextMonthFocus?.trim()) return row.nextMonthFocus.trim()
  return pickFocusFromMerged(mergeMonthlyResponses(row))
}

export function pickQuarterlyFocusText(row: ReviewTextRow | null): string | null {
  if (!row) return null
  return pickFocusFromMerged(mergeQuarterlyResponses(row))
}

export type MonthlyFocusContext = {
  month: number
  monthLabel: string
  focusText: string
  source: "plan" | "current" | "previous"
  /** From the current calendar month's saved plan. */
  topIntentions?: string[]
}

export function resolveMonthlyFocusContext(
  currentMonthPlan: { monthFocus: string | null } | null,
  currentMonthReview: ReviewTextRow | null,
  previousMonthReview: ReviewTextRow | null,
  currentMonth: number,
  previousMonth: number,
): MonthlyFocusContext | null {
  const planFocus = currentMonthPlan?.monthFocus?.trim()
  if (planFocus) {
    return {
      month: currentMonth,
      monthLabel:
        MONTH_SHORT_LABELS[currentMonth - 1] ?? `Month ${currentMonth}`,
      focusText: planFocus,
      source: "plan",
    }
  }

  const fromPreviousExplicit = previousMonthReview?.nextMonthFocus?.trim()
  if (fromPreviousExplicit) {
    return {
      month: previousMonth,
      monthLabel:
        MONTH_SHORT_LABELS[previousMonth - 1] ?? `Month ${previousMonth}`,
      focusText: fromPreviousExplicit,
      source: "previous",
    }
  }

  const fromCurrent = pickMonthlyFocusText(currentMonthReview)
  if (fromCurrent) {
    return {
      month: currentMonth,
      monthLabel: MONTH_SHORT_LABELS[currentMonth - 1] ?? `Month ${currentMonth}`,
      focusText: fromCurrent,
      source: "current",
    }
  }

  const fromPrevious = pickMonthlyFocusText(previousMonthReview)
  if (fromPrevious) {
    return {
      month: previousMonth,
      monthLabel: MONTH_SHORT_LABELS[previousMonth - 1] ?? `Month ${previousMonth}`,
      focusText: fromPrevious,
      source: "previous",
    }
  }

  return null
}

export type QuarterlyFocusContext = {
  quarter: Quarter
  focusText: string
  source: "plan" | "review"
  topIntentions?: string[]
}

export function resolveQuarterlyFocusContext(
  currentQuarterPlan: {
    quarterFocus: string | null
    topIntentions?: unknown
  } | null,
  currentQuarterReview: ReviewTextRow | null,
  quarter: Quarter,
): QuarterlyFocusContext | null {
  const planFocus = currentQuarterPlan?.quarterFocus?.trim()
  const topIntentions = parseTopIntentions(currentQuarterPlan?.topIntentions)

  if (planFocus) {
    return {
      quarter,
      focusText: planFocus,
      source: "plan",
      ...(topIntentions.length > 0 && { topIntentions }),
    }
  }

  const reviewFocus = pickQuarterlyFocusText(currentQuarterReview)
  if (reviewFocus) {
    return {
      quarter,
      focusText: reviewFocus,
      source: "review",
    }
  }

  if (topIntentions.length > 0) {
    return {
      quarter,
      focusText: "",
      source: "plan",
      topIntentions,
    }
  }

  return null
}
