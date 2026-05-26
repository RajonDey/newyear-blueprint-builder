import { db } from "@/lib/db"
import { getWeekNumber } from "@/lib/utils"
import { ACHIEVEMENTS } from "@/lib/constants/achievements"
import { getPlanTheme } from "@/lib/yearly-plan/reflections"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export type WrappedData = Awaited<ReturnType<typeof getWrappedData>>

export async function getWrappedData(userId: string, year?: number) {
  const targetYear = year ?? new Date().getFullYear()

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, year: targetYear },
    include: {
      projects: {
        include: {
          checkpoints: true,
          motivation: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      wheelEntries: { orderBy: { recordedAt: "desc" } },
      weeklyCheckIns: { orderBy: { completedAt: "asc" } },
      quarterlyReviews: { orderBy: { quarter: "asc" } },
      antiGoals: true,
    },
  })

  if (!plan) return null

  const streak = await db.streak.findFirst({
    where: { userId, type: "WEEKLY_CHECK_IN" },
  })

  const achievements = await db.achievement.findMany({
    where: { userId },
    orderBy: { earnedAt: "asc" },
  })

  const latestWheel = plan.wheelEntries.reduce<Record<string, number>>(
    (acc, e) => {
      if (!(e.category in acc)) acc[e.category] = e.rating
      return acc
    },
    {}
  )

  const wheelScores = Object.entries(latestWheel).map(([category, rating]) => ({
    category: CATEGORY_LABELS[category] || category,
    rating,
  }))

  const moodEntries = plan.weeklyCheckIns
    .filter((c) => c.overallMood != null)
    .map((c) => ({ week: c.weekNumber, mood: c.overallMood! }))
  const avgMood =
    moodEntries.length > 0
      ? moodEntries.reduce((s, m) => s + m.mood, 0) / moodEntries.length
      : null

  const completedGoals = plan.projects.filter((g) => g.status === "COMPLETED")
  const totalCheckIns = plan.weeklyCheckIns.length
  const totalReviews = plan.quarterlyReviews.length

  const achievementsWithMeta = achievements.map((a) => ({
    ...a,
    meta: ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS],
  }))

  return {
    plan: {
      id: plan.id,
      year: plan.year,
      theme: getPlanTheme(plan.reflections),
      status: plan.status,
    },
    stats: {
      totalGoals: plan.projects.length,
      completedGoals: completedGoals.length,
      totalCheckIns,
      avgMood,
      longestStreak: streak?.longestStreak ?? 0,
      totalReviews,
      totalAntiGoals: plan.antiGoals.length,
    },
    projects: plan.projects,
    completedGoals,
    wheelScores,
    achievements: achievementsWithMeta,
    reflections: plan.reflections as Record<string, string> | null,
    quarterlyReviews: plan.quarterlyReviews,
  }
}
