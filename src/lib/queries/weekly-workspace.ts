import { db } from "@/lib/db"
import { getCheckInFormData } from "@/lib/queries/check-in"
import {
  MONTH_SHORT_LABELS,
  resolveMonthlyFocusContext,
  getCurrentQuarter,
} from "@/lib/queries/rhythm-context"
import { getIsoWeekContextInTimeZone, getPreviousIsoWeekContext } from "@/lib/utils"
import { getWeeklyPriorityProjects } from "@/lib/queries/weekly-priorities"
import { parseTopIntentions } from "@/types/monthly"
import type { WeeklyCommitment } from "@/types/weekly"

const monthlyReviewSelect = {
  summary: true,
  winsText: true,
  challengesText: true,
  adjustments: true,
  nextMonthFocus: true,
  responses: true,
} as const

async function getMonthlyFocusForWeeklyPlan(planId: string, planYear: number) {
  const currentMonth = new Date().getMonth() + 1
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1

  const [currentPlan, currentReview, previousReview, quarterPlan] =
    await Promise.all([
    db.monthlyPlan.findUnique({
      where: {
        planId_month_year: { planId, month: currentMonth, year: planYear },
      },
      select: { monthFocus: true, topIntentions: true },
    }),
    db.monthlyReview.findUnique({
      where: {
        planId_month_year: { planId, month: currentMonth, year: planYear },
      },
      select: monthlyReviewSelect,
    }),
    db.monthlyReview.findUnique({
      where: {
        planId_month_year: { planId, month: previousMonth, year: planYear },
      },
      select: monthlyReviewSelect,
    }),
    db.quarterlyPlan.findUnique({
      where: {
        planId_quarter: { planId, quarter: getCurrentQuarter() },
      },
      select: { topIntentions: true },
    }),
  ])

  let topIntentions = parseTopIntentions(currentPlan?.topIntentions)
  if (topIntentions.length === 0) {
    topIntentions = parseTopIntentions(quarterPlan?.topIntentions)
  }
  const focus = resolveMonthlyFocusContext(
    currentPlan,
    currentReview,
    previousReview,
    currentMonth,
    previousMonth,
  )

  if (!focus && topIntentions.length === 0) return null

  if (focus) {
    return {
      ...focus,
      ...(topIntentions.length > 0 && { topIntentions }),
    }
  }

  return {
    month: currentMonth,
    monthLabel: MONTH_SHORT_LABELS[currentMonth - 1] ?? `Month ${currentMonth}`,
    focusText: "",
    source: "plan" as const,
    ...(topIntentions.length > 0 && { topIntentions }),
  }
}

function parseCommitments(raw: unknown): WeeklyCommitment[] {
  if (!Array.isArray(raw)) return []
  return (raw as unknown[]).flatMap((row) => {
    if (
      row &&
      typeof row === "object" &&
      "text" in row &&
      "kind" in row &&
      typeof (row as { text: unknown }).text === "string" &&
      ((row as { kind: unknown }).kind === "core" ||
        (row as { kind: unknown }).kind === "follow_up")
    ) {
      return [
        {
          text: (row as { text: string }).text,
          kind: (row as { kind: "core" | "follow_up" }).kind,
        },
      ]
    }
    return []
  })
}

export async function getWeeklyWorkspaceData(userId: string) {
  const base = await getCheckInFormData(userId)
  if (!base) return null

  const weeklyPlan = await db.weeklyPlan.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: base.plan.id,
        weekNumber: base.weekNumber,
        year: base.year,
      },
    },
  })

  const prev = getPreviousIsoWeekContext(base.weekNumber, base.year)

  const [prevCheckIn, monthlyFocus] = await Promise.all([
    db.weeklyCheckIn.findUnique({
      where: {
        planId_weekNumber_year: {
          planId: base.plan.id,
          weekNumber: prev.weekNumber,
          year: prev.year,
        },
      },
      select: { nextWeekFocus: true },
    }),
    getMonthlyFocusForWeeklyPlan(base.plan.id, base.plan.year),
  ])

  return {
    ...base,
    isCurrentWeek: true,
    weeklyPlan: weeklyPlan
      ? {
          priorityProjectIds: [...weeklyPlan.priorityProjectIds],
          protectCategory: weeklyPlan.protectCategory,
          commitments: parseCommitments(weeklyPlan.commitments),
        }
      : null,
    suggestionFromLastWeek: prevCheckIn?.nextWeekFocus ?? null,
    monthlyFocus,
  }
}

export async function getWeeklyWorkspaceDataForWeek(
  userId: string,
  weekNumber: number,
  year: number
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const now = new Date()
  const current = getIsoWeekContextInTimeZone(now, user?.timezone || "UTC")
  const isCurrentWeek = current.weekNumber === weekNumber && current.year === year

  if (isCurrentWeek) {
    return getWeeklyWorkspaceData(userId)
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      projects: {
        select: { id: true, title: true, category: true },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      },
    },
  })

  if (!plan) return null

  const [weeklyPlan, existingCheckIn] = await Promise.all([
    db.weeklyPlan.findUnique({
      where: {
        planId_weekNumber_year: { planId: plan.id, weekNumber, year },
      },
    }),
    db.weeklyCheckIn.findUnique({
      where: {
        planId_weekNumber_year: { planId: plan.id, weekNumber, year },
      },
      include: { projectCheckIns: true },
    }),
  ])

  return {
    plan: { id: plan.id, year: plan.year },
    projects: plan.projects,
    weekNumber,
    year,
    isCurrentWeek: false,
    existingCheckIn,
    weeklyPlan: weeklyPlan
      ? {
          priorityProjectIds: [...weeklyPlan.priorityProjectIds],
          protectCategory: weeklyPlan.protectCategory,
          commitments: parseCommitments(weeklyPlan.commitments),
        }
      : null,
    suggestionFromLastWeek: null,
    monthlyFocus: null,
  }
}

/** Ordered priority projects for the current calendar week (for Daily Habits banner). */
export async function getWeeklyFocusGoals(userId: string) {
  const snapshot = await getWeeklyPriorityProjects(userId)
  if (!snapshot) {
    return {
      projects: [] as { id: string; title: string }[],
      protectCategory: null as string | null,
    }
  }
  return {
    projects: snapshot.projects,
    protectCategory: snapshot.protectCategory,
  }
}
