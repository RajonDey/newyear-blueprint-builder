import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"
import { getActiveSystemsPeriodProgress, getSystemsManagement } from "@/lib/queries/systems"
import { getRhythmStats } from "@/lib/queries/rhythm-stats"
import {
  buildDailyStateTrendSeries,
  countDailyStateTrendPoints,
  dailyStateTrendSinceYmd,
  parseYmdToUtcMidnight,
  DAILY_STATE_CHART_MIN_DAYS,
  DAILY_STATE_TREND_DAYS,
} from "@/lib/analytics/daily-state-trend"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export async function getAnalyticsData(userId: string) {
  const [user, plan] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    }),
    db.yearlyPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            checkpoints: { select: { id: true, status: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        weeklyCheckIns: {
          orderBy: { completedAt: "asc" },
          include: { projectCheckIns: true },
        },
        wheelEntries: { orderBy: { recordedAt: "asc" } },
        quarterlyReviews: { orderBy: { quarter: "asc" } },
      },
    }),
  ])

  if (!plan) return null

  const now = new Date()
  const timeZone = user?.timezone || "UTC"
  const { weekNumber } = getIsoWeekContextInTimeZone(now, timeZone)
  const year = plan.year

  const sinceYmd = dailyStateTrendSinceYmd(DAILY_STATE_TREND_DAYS, timeZone, now)
  const dailyStateRows = await db.dailyState.findMany({
    where: {
      userId,
      date: { gte: parseYmdToUtcMidnight(sinceYmd) },
    },
    orderBy: { date: "asc" },
    select: { date: true, mood: true, energy: true },
  })

  const dailyStateTrend = buildDailyStateTrendSeries(
    dailyStateRows,
    DAILY_STATE_TREND_DAYS,
    timeZone,
    now,
  )
  const dailyStateTrendDays = countDailyStateTrendPoints(dailyStateTrend)
  const showDailyStateChart = dailyStateTrendDays >= DAILY_STATE_CHART_MIN_DAYS

  const [streak, systemsToday, systemsManagement, rhythmStats] = await Promise.all([
    db.streak.findFirst({
      where: { userId, type: "WEEKLY_CHECK_IN" },
      select: { currentStreak: true, longestStreak: true },
    }),
    getActiveSystemsPeriodProgress(userId),
    getSystemsManagement(userId),
    getRhythmStats(userId),
  ])

  const activeSystems = systemsManagement.active
  const systemsConsistencyPct =
    activeSystems.length > 0
      ? Math.round(
          activeSystems.reduce((sum, row) => sum + row.consistencyPct, 0) /
            activeSystems.length,
        )
      : null

  const moodOverTime = plan.weeklyCheckIns
    .filter((c) => c.overallMood != null)
    .map((c) => ({
      week: c.weekNumber,
      label: `W${c.weekNumber}`,
      mood: c.overallMood!,
      date: c.completedAt,
    }))

  const goalProgressOverTime = plan.projects.map((goal) => {
    const ratings = plan.weeklyCheckIns
      .map((ci) => {
        const gc = ci.projectCheckIns.find((g) => g.projectId === goal.id)
        return gc ? { week: ci.weekNumber, rating: gc.progressRating } : null
      })
      .filter(Boolean) as { week: number; rating: number }[]
    return {
      projectId: goal.id,
      title: goal.title,
      category: goal.category,
      categoryLabel: CATEGORY_LABELS[goal.category] || goal.category,
      data: ratings,
    }
  })

  const latestByCategory = new Map<string, number>()
  for (const e of [...plan.wheelEntries].reverse()) {
    if (e.recordedAt <= now && !latestByCategory.has(e.category)) {
      latestByCategory.set(e.category, e.rating)
    }
  }
  const wheelScores = Array.from(latestByCategory.entries()).map(
    ([category, rating]) => ({
      category: CATEGORY_LABELS[category] || category,
      rating,
    })
  )

  const avgMood =
    moodOverTime.length > 0
      ? moodOverTime.reduce((s, m) => s + m.mood, 0) / moodOverTime.length
      : null

  const totalCheckIns = plan.weeklyCheckIns.length
  const completedGoals = plan.projects.filter((g) => g.status === "COMPLETED").length
  const totalGoals = plan.projects.length

  const hasWeeklyMood = moodOverTime.length > 0
  const hasProjectRatings = goalProgressOverTime.some((g) => g.data.length > 0)
  const hasAnyTrendData =
    hasWeeklyMood || showDailyStateChart || hasProjectRatings

  return {
    plan: { id: plan.id, year: plan.year },
    moodOverTime,
    dailyStateTrend,
    dailyStateTrendDays,
    showDailyStateChart,
    goalProgressOverTime,
    wheelScores,
    avgMood,
    totalCheckIns,
    completedGoals,
    totalGoals,
    quarterlyReviews: plan.quarterlyReviews,
    currentWeek: weekNumber,
    streak: {
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
    },
    systemsToday,
    systemsConsistencyPct,
    activeSystemCount: activeSystems.length,
    rhythmStats,
    hasAnyTrendData,
  }
}

export type AnalyticsData = NonNullable<
  Awaited<ReturnType<typeof getAnalyticsData>>
>
