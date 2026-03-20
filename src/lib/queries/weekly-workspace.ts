import { db } from "@/lib/db"
import { getCheckInFormData } from "@/lib/queries/check-in"
import { getWeekNumber } from "@/lib/utils"
import type { WeeklyCommitment } from "@/types/weekly"

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

  const prev =
    base.weekNumber === 1
      ? { weekNumber: 52, year: base.year - 1 }
      : { weekNumber: base.weekNumber - 1, year: base.year }

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

  let commitments: WeeklyCommitment[] = []
  if (weeklyPlan?.commitments != null && Array.isArray(weeklyPlan.commitments)) {
    commitments = (weeklyPlan.commitments as unknown[]).flatMap((row) => {
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

  return {
    ...base,
    weeklyPlan: weeklyPlan
      ? {
          priorityGoalIds: [...weeklyPlan.priorityGoalIds],
          protectCategory: weeklyPlan.protectCategory,
          commitments,
        }
      : null,
    suggestionFromLastWeek: prevCheckIn?.nextWeekFocus ?? null,
  }
}

/** Ordered priority goals for the current calendar week (for Daily Systems banner). */
export async function getWeeklyFocusGoals(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })
  if (!plan) {
    return {
      goals: [] as { id: string; title: string }[],
      protectCategory: null as string | null,
    }
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

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
