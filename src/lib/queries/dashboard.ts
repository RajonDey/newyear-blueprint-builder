import { db } from "@/lib/db"
import { getWeekNumber } from "@/lib/utils"
import { getActiveSystemsPeriodProgress } from "@/lib/queries/systems"

export async function getDashboardData(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      goals: {
        select: {
          id: true,
          title: true,
          category: true,
          type: true,
          status: true,
          dailySystems: { select: { id: true, isActive: true } },
          checkpointGoals: { select: { id: true, status: true, quarter: true } },
        },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      },
      wheelEntries: {
        orderBy: { recordedAt: "desc" },
        take: 6,
        distinct: ["category"],
      },
      weeklyCheckIns: {
        orderBy: { completedAt: "desc" },
        take: 1,
        select: { weekNumber: true, overallMood: true, completedAt: true },
      },
    },
  })

  if (!plan) return null

  const now = new Date()
  const systemsProgress = await getActiveSystemsPeriodProgress(userId)

  const streak = await db.streak.findFirst({
    where: { userId, type: "WEEKLY_CHECK_IN" },
  })

  const month = now.getMonth()
  const currentQuarter = month < 3 ? "Q1" : month < 6 ? "Q2" : month < 9 ? "Q3" : "Q4"

  const goalStats = {
    total: plan.goals.length,
    completed: plan.goals.filter((g) => g.status === "COMPLETED").length,
    inProgress: plan.goals.filter((g) => g.status === "IN_PROGRESS" || g.status === "ON_TRACK").length,
    atRisk: plan.goals.filter((g) => g.status === "AT_RISK").length,
  }

  return {
    plan: {
      id: plan.id,
      year: plan.year,
      status: plan.status,
    },
    goals: plan.goals,
    goalStats,
    wheelScores: plan.wheelEntries.map((e) => ({
      category: e.category,
      rating: e.rating,
    })),
    streak: streak
      ? { current: streak.currentStreak, longest: streak.longestStreak }
      : { current: 0, longest: 0 },
    systemsToday: {
      completed: systemsProgress.completed,
      total: systemsProgress.total,
    },
    lastCheckIn: plan.weeklyCheckIns[0] ?? null,
    currentQuarter,
    currentWeek: getWeekNumber(now),
  }
}
