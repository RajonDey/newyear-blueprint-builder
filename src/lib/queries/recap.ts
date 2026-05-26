import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"
import { getQuarterLabel } from "@/lib/nav-config"
import type { Quarter } from "@prisma/client"
import { mergeMonthlyResponses } from "@/lib/review-templates"

function recapText(value: string | undefined): string | null {
  if (!value?.trim()) return null
  return value
}

export type RecapPeriod = "weekly" | "monthly" | "quarterly"

/**
 * Fetches the most recent review/check-in for the given period from the
 * user's active plan, plus enough context to render a shareable recap card.
 *
 * Read-only — does not create any rows. Falls back gracefully when the
 * underlying review/check-in has not been completed yet.
 */
export async function getRecapData(userId: string, period: RecapPeriod) {
  const [user, plan] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { timezone: true, name: true } }),
    db.yearlyPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        year: true,
        reflections: true,
        wheelEntries: {
          orderBy: { recordedAt: "desc" },
          distinct: ["category"],
          select: { category: true, rating: true, recordedAt: true },
        },
      },
    }),
  ])

  if (!plan) return null

  const now = new Date()
  const tz = user?.timezone || "UTC"
  const { weekNumber, year } = getIsoWeekContextInTimeZone(now, tz)
  const quarter = getQuarterLabel(now)
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now)
  const themeMaybe =
    plan.reflections && typeof plan.reflections === "object" && !Array.isArray(plan.reflections)
      ? (plan.reflections as { theme?: string }).theme
      : undefined

  if (period === "weekly") {
    const checkIn = await db.weeklyCheckIn.findFirst({
      where: { planId: plan.id, weekNumber, year },
      include: {
        projectCheckIns: {
          select: {
            projectId: true,
            progressRating: true,
            blockers: true,
            project: { select: { title: true } },
          },
        },
      },
    })
    const weeklyPlan = await db.weeklyPlan.findFirst({
      where: { planId: plan.id, weekNumber, year },
      select: { priorityProjectIds: true, commitments: true },
    })
    let priorityGoals: { id: string; title: string }[] = []
    if (weeklyPlan?.priorityProjectIds?.length) {
      priorityGoals = await db.project.findMany({
        where: { id: { in: weeklyPlan.priorityProjectIds } },
        select: { id: true, title: true },
      })
    }
    return {
      kind: "weekly" as const,
      userName: user?.name ?? null,
      year: plan.year,
      theme: themeMaybe,
      weekNumber,
      quarter,
      mood: checkIn?.overallMood ?? null,
      notes: checkIn?.notes ?? null,
      nextWeekFocus: checkIn?.nextWeekFocus ?? null,
      priorityGoals,
      commitments: weeklyPlan?.commitments ?? null,
      projectCheckIns: checkIn?.projectCheckIns ?? [],
      completed: Boolean(checkIn),
    }
  }

  if (period === "monthly") {
    const month = now.getMonth() + 1
    const review = await db.monthlyReview.findFirst({
      where: { planId: plan.id, month, year: plan.year },
    })
    const merged = review ? mergeMonthlyResponses(review) : {}
    return {
      kind: "monthly" as const,
      userName: user?.name ?? null,
      year: plan.year,
      theme: themeMaybe,
      monthName,
      quarter,
      summary: recapText(merged.summary),
      winsText: recapText(merged.winsText),
      challengesText: recapText(merged.challengesText),
      adjustments: recapText(merged.adjustments),
      completed: Boolean(review),
    }
  }

  // quarterly
  const review = await db.quarterlyReview.findFirst({
    where: { planId: plan.id, quarter: quarter as Quarter },
  })
  const merged = review ? mergeMonthlyResponses(review) : {}
  return {
    kind: "quarterly" as const,
    userName: user?.name ?? null,
    year: plan.year,
    theme: themeMaybe,
    quarter,
    summary: recapText(merged.summary),
    winsText: recapText(merged.winsText),
    challengesText: recapText(merged.challengesText),
    adjustments: recapText(merged.adjustments),
    wheelEntries: plan.wheelEntries,
    completed: Boolean(review),
  }
}

export type RecapData = NonNullable<Awaited<ReturnType<typeof getRecapData>>>
