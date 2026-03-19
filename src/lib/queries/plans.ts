import { db } from "@/lib/db"

export async function getActivePlan(userId: string) {
  return db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      goals: {
        include: {
          checkpointGoals: true,
          dailySystems: true,
          habits: true,
          motivation: true,
        },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      },
      wheelEntries: { orderBy: { recordedAt: "desc" } },
      antiGoals: true,
      _count: { select: { weeklyCheckIns: true } },
    },
    orderBy: { year: "desc" },
  })
}

export async function getPlanById(planId: string, userId: string) {
  return db.yearlyPlan.findFirst({
    where: { id: planId, userId },
    include: {
      goals: {
        include: {
          checkpointGoals: { orderBy: { quarter: "asc" } },
          dailySystems: true,
          habits: true,
          motivation: true,
          goalCheckIns: { orderBy: { weeklyCheckIn: { completedAt: "desc" } }, take: 5 },
        },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      },
      wheelEntries: { orderBy: { recordedAt: "desc" } },
      antiGoals: true,
      weeklyCheckIns: { orderBy: { completedAt: "desc" }, take: 10, include: { goalCheckIns: true } },
      quarterlyReviews: { orderBy: { quarter: "asc" } },
    },
  })
}

export async function getUserPlans(userId: string) {
  return db.yearlyPlan.findMany({
    where: { userId },
    include: {
      goals: { select: { id: true, title: true, category: true, status: true, type: true } },
      _count: { select: { weeklyCheckIns: true, goals: true } },
    },
    orderBy: { year: "desc" },
  })
}
