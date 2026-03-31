import { db } from "@/lib/db"
import { getCheckInFormData } from "@/lib/queries/check-in"
import { getIsoWeekContextInTimeZone, getPreviousIsoWeekContext } from "@/lib/utils"
import type { WeeklyCommitment } from "@/types/weekly"

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

  const prevCheckIn = await db.weeklyCheckIn.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: base.plan.id,
        weekNumber: prev.weekNumber,
        year: prev.year,
      },
    },
    select: { nextWeekFocus: true },
  })

  return {
    ...base,
    isCurrentWeek: true,
    weeklyPlan: weeklyPlan
      ? {
          priorityGoalIds: [...weeklyPlan.priorityGoalIds],
          protectCategory: weeklyPlan.protectCategory,
          commitments: parseCommitments(weeklyPlan.commitments),
        }
      : null,
    suggestionFromLastWeek: prevCheckIn?.nextWeekFocus ?? null,
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
      goals: {
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
      include: { goalCheckIns: true },
    }),
  ])

  return {
    plan: { id: plan.id, year: plan.year },
    goals: plan.goals,
    weekNumber,
    year,
    isCurrentWeek: false,
    existingCheckIn,
    weeklyPlan: weeklyPlan
      ? {
          priorityGoalIds: [...weeklyPlan.priorityGoalIds],
          protectCategory: weeklyPlan.protectCategory,
          commitments: parseCommitments(weeklyPlan.commitments),
        }
      : null,
    suggestionFromLastWeek: null,
  }
}

/** Ordered priority goals for the current calendar week (for Daily Habits banner). */
export async function getWeeklyFocusGoals(userId: string) {
  const [user, plan] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    }),
    db.yearlyPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { id: true },
    }),
  ])
  if (!plan) {
    return {
      goals: [] as { id: string; title: string }[],
      protectCategory: null as string | null,
    }
  }

  const now = new Date()
  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    now,
    user?.timezone || "UTC"
  )

  const wp = await db.weeklyPlan.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: plan.id,
        weekNumber,
        year,
      },
    },
  })
  if (!wp) {
    return { goals: [] as { id: string; title: string }[], protectCategory: null }
  }

  if (!wp.priorityGoalIds.length) {
    return {
      goals: [] as { id: string; title: string }[],
      protectCategory: wp.protectCategory,
    }
  }

  const found = await db.goal.findMany({
    where: { id: { in: wp.priorityGoalIds }, planId: plan.id },
    select: { id: true, title: true },
  })
  const byId = new Map(found.map((g) => [g.id, g]))
  const goals = wp.priorityGoalIds
    .map((id) => byId.get(id))
    .filter((g): g is { id: string; title: string } => g != null)

  return { goals, protectCategory: wp.protectCategory ?? null }
}
