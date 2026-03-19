import { db } from "@/lib/db"
import { getWeekNumber } from "@/lib/utils"

const CATEGORY_LABELS: Record<string, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export async function getAnalyticsData(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      goals: {
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          checkpointGoals: { select: { id: true, status: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      weeklyCheckIns: {
        orderBy: { completedAt: "asc" },
        include: { goalCheckIns: true },
      },
      wheelEntries: { orderBy: { recordedAt: "asc" } },
      quarterlyReviews: { orderBy: { quarter: "asc" } },
    },
  })

  if (!plan) return null

  const now = new Date()
  const year = plan.year

  const moodOverTime = plan.weeklyCheckIns
    .filter((c) => c.overallMood != null)
    .map((c) => ({
      week: c.weekNumber,
      label: `W${c.weekNumber}`,
      mood: c.overallMood!,
      date: c.completedAt,
    }))

  const goalProgressOverTime = plan.goals.map((goal) => {
    const ratings = plan.weeklyCheckIns
      .map((ci) => {
        const gc = ci.goalCheckIns.find((g) => g.goalId === goal.id)
        return gc ? { week: ci.weekNumber, rating: gc.progressRating } : null
      })
      .filter(Boolean) as { week: number; rating: number }[]
    return {
      goalId: goal.id,
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
  const completedGoals = plan.goals.filter((g) => g.status === "COMPLETED").length
  const totalGoals = plan.goals.length

  return {
    plan: { id: plan.id, year: plan.year },
    moodOverTime,
    goalProgressOverTime,
    wheelScores,
    avgMood,
    totalCheckIns,
    completedGoals,
    totalGoals,
    quarterlyReviews: plan.quarterlyReviews,
    currentWeek: getWeekNumber(now),
  }
}
