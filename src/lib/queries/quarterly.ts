import { db } from "@/lib/db"
import type { Quarter } from "@prisma/client"
import { getCurrentQuarter } from "@/lib/queries/rhythm-context"

const QUARTER_ORDER: Quarter[] = ["Q1", "Q2", "Q3", "Q4"]

function previousQuarter(quarter: Quarter): Quarter {
  const idx = QUARTER_ORDER.indexOf(quarter)
  return QUARTER_ORDER[idx === 0 ? 3 : idx - 1]!
}

function parseWheelSnapshot(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const out: Record<string, number> = {}
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "number") out[key] = value
  }
  return Object.keys(out).length > 0 ? out : null
}

export async function getQuarterlyReviewData(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      wheelEntries: { orderBy: { recordedAt: "desc" } },
      quarterlyReviews: { orderBy: { quarter: "asc" } },
      quarterlyPlans: { orderBy: { quarter: "asc" } },
      monthlyReviews: {
        select: {
          month: true,
          year: true,
          summary: true,
          winsText: true,
          challengesText: true,
          adjustments: true,
          responses: true,
          completedAt: true,
        },
        orderBy: { month: "asc" },
      },
      projects: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          checkpoints: { select: { quarter: true, status: true } },
        },
      },
    },
  })

  if (!plan) return null

  const wheelScores = plan.wheelEntries.reduce<Record<string, number>>(
    (acc, e) => {
      if (!(e.category in acc)) acc[e.category] = e.rating
      return acc
    },
    {}
  )

  const prevQuarter = previousQuarter(getCurrentQuarter())
  const prevReview = plan.quarterlyReviews.find((r) => r.quarter === prevQuarter)
  const previousQuarterWheel = parseWheelSnapshot(prevReview?.wheelOfLifeSnapshot)

  return {
    plan: { id: plan.id, year: plan.year },
    projects: plan.projects,
    wheelScores,
    previousQuarterWheel,
    reviews: plan.quarterlyReviews,
    quarterlyPlans: plan.quarterlyPlans,
    monthlyReviews: plan.monthlyReviews,
  }
}

export async function getQuarterlyReview(
  userId: string,
  quarter: Quarter
) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })
  if (!plan) return null

  return db.quarterlyReview.findUnique({
    where: {
      planId_quarter: { planId: plan.id, quarter },
    },
  })
}
