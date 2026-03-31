import { subWeeks } from "date-fns"
import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone, getPreviousIsoWeekContext } from "@/lib/utils"
import { getActiveSystemsPeriodProgress } from "@/lib/queries/systems"

export async function getDashboardData(userId: string) {
  const [user, plan] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    }),
    db.yearlyPlan.findFirst({
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
          take: 5,
          select: { weekNumber: true, year: true, overallMood: true, completedAt: true },
        },
      },
    }),
  ])

  if (!plan) return null

  const now = new Date()
  const timeZone = user?.timezone || "UTC"
  const { weekNumber, year: weekYear } = getIsoWeekContextInTimeZone(now, timeZone)
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

  const prevWeek = getPreviousIsoWeekContext(weekNumber, weekYear)
  const prevCheckIn = plan.weeklyCheckIns.find(
    (ci) => ci.weekNumber === prevWeek.weekNumber && ci.year === prevWeek.year
  )
  const lastMood = plan.weeklyCheckIns[0]?.overallMood ?? null
  const prevMood = plan.weeklyCheckIns[1]?.overallMood ?? null

  const totalCheckIns = await db.weeklyCheckIn.count({
    where: { planId: plan.id },
  })

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
    currentWeek: weekNumber,
    trends: {
      totalCheckIns,
      lastMood,
      prevMood,
      moodDelta: lastMood && prevMood ? lastMood - prevMood : null,
    },
  }
}
