import { db } from "@/lib/db"
import type { Quarter } from "@prisma/client"

export async function getQuarterlyReviewData(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      wheelEntries: { orderBy: { recordedAt: "desc" } },
      quarterlyReviews: { orderBy: { quarter: "asc" } },
      goals: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          checkpointGoals: { select: { quarter: true, status: true } },
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

  return {
    plan: { id: plan.id, year: plan.year },
    goals: plan.goals,
    wheelScores,
    reviews: plan.quarterlyReviews,
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
