import { db } from "@/lib/db"

export async function getGoalsByPlan(planId: string, userId: string) {
  return db.goal.findMany({
    where: { planId, plan: { userId } },
    include: {
      checkpointGoals: { orderBy: { quarter: "asc" } },
      dailySystems: true,
      habits: true,
      motivation: true,
      _count: { select: { goalCheckIns: true } },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  })
}

export async function getGoalById(goalId: string, userId: string) {
  return db.goal.findFirst({
    where: { id: goalId, plan: { userId } },
    include: {
      plan: { select: { id: true, year: true, status: true } },
      checkpointGoals: { orderBy: { quarter: "asc" } },
      dailySystems: {
        include: {
          completions: { orderBy: { date: "desc" }, take: 30 },
        },
      },
      habits: true,
      motivation: true,
      actions: { orderBy: { type: "asc" } },
      goalCheckIns: {
        orderBy: { weeklyCheckIn: { completedAt: "desc" } },
        take: 10,
        include: { weeklyCheckIn: { select: { weekNumber: true, year: true } } },
      },
    },
  })
}

export async function getGoalsForUser(userId: string) {
  const activePlan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })

  if (!activePlan) return []

  return getGoalsByPlan(activePlan.id, userId)
}
