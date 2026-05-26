import { db } from "@/lib/db"
import {
  getIsoWeekContextInTimeZone,
  getPreviousIsoWeekContext,
} from "@/lib/utils"

export type WeeklyConsistencyWeek = {
  weekNumber: number
  year: number
  label: string
  reviewed: boolean
}

export type RhythmStats = {
  weeklyStreak: number
  longestStreak: number
  monthsReviewed: number
  quartersReviewed: number
  weekConsistencyPct: number
  weeklyConsistency: WeeklyConsistencyWeek[]
}

/** Last 12 ISO weeks — whether a weekly review was saved each week. */
export async function getWeeklyConsistencySeries(
  planId: string,
  userId: string,
): Promise<WeeklyConsistencyWeek[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const tz = user?.timezone || "UTC"
  const current = getIsoWeekContextInTimeZone(new Date(), tz)

  const weeks: WeeklyConsistencyWeek[] = []
  let w = current.weekNumber
  let y = current.year

  for (let i = 0; i < 12; i++) {
    weeks.unshift({
      weekNumber: w,
      year: y,
      label: `W${w}`,
      reviewed: false,
    })
    const prev = getPreviousIsoWeekContext(w, y)
    w = prev.weekNumber
    y = prev.year
  }

  const checkIns = await db.weeklyCheckIn.findMany({
    where: {
      planId,
      OR: weeks.map((week) => ({
        weekNumber: week.weekNumber,
        year: week.year,
      })),
    },
    select: { weekNumber: true, year: true },
  })

  const reviewedSet = new Set(
    checkIns.map((c) => `${c.year}-${c.weekNumber}`),
  )

  return weeks.map((week) => ({
    ...week,
    reviewed: reviewedSet.has(`${week.year}-${week.weekNumber}`),
  }))
}

/** Compact rhythm metrics for header + weekly sidebar. */
export async function getRhythmStats(userId: string): Promise<RhythmStats | null> {
  const [streak, plan] = await Promise.all([
    db.streak.findFirst({
      where: { userId, type: "WEEKLY_CHECK_IN" },
    }),
    db.yearlyPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        monthlyReviews: { select: { month: true } },
        quarterlyReviews: { select: { quarter: true } },
      },
    }),
  ])

  if (!plan) return null

  const weeklyConsistency = await getWeeklyConsistencySeries(plan.id, userId)
  const reviewedCount = weeklyConsistency.filter((w) => w.reviewed).length
  const weekConsistencyPct = Math.round((reviewedCount / 12) * 100)

  return {
    weeklyStreak: streak?.currentStreak ?? 0,
    longestStreak: streak?.longestStreak ?? 0,
    monthsReviewed: plan.monthlyReviews.length,
    quartersReviewed: plan.quarterlyReviews.length,
    weekConsistencyPct,
    weeklyConsistency,
  }
}
