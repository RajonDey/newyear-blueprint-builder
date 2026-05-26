import { db } from "@/lib/db"
import {
  getIsoWeekContextInTimeZone,
  getPreviousIsoWeekContext,
} from "@/lib/utils"
import {
  getActiveSystemsPeriodProgress,
  getSystemsForToday,
} from "@/lib/queries/systems"
import { getDailyStateForDate } from "@/lib/queries/today"
import { getTodayPrompt } from "@/lib/today-prompts"
import { getYmdInTimeZone } from "@/lib/systems-period"
import { getPlanTheme } from "@/lib/yearly-plan/reflections"
import { getWeeklyPriorityProjects } from "@/lib/queries/weekly-priorities"
import { getVisionMilestoneProjectSummary } from "@/lib/queries/vision-projects"

/**
 * Aggregated dashboard fetcher.
 *
 * Returns everything the Today landing page needs in a single typed object,
 * so individual sub-components don't re-fetch (and the page renders in one
 * round trip).
 *
 * Returns `null` when the user has no active plan — the page is expected to
 * fall back to onboarding/welcome state in that case.
 */
export async function getDashboardData(userId: string) {
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
            type: true,
            status: true,
            systems: { select: { id: true, isActive: true } },
            checkpoints: { select: { id: true, status: true, quarter: true } },
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
          select: {
            weekNumber: true,
            year: true,
            overallMood: true,
            completedAt: true,
          },
        },
      },
    }),
  ])

  if (!plan) return null

  const now = new Date()
  const timeZone = user?.timezone || "UTC"
  const { weekNumber, year: weekYear } = getIsoWeekContextInTimeZone(
    now,
    timeZone,
  )
  const todayYmd = getYmdInTimeZone(now, timeZone)

  const [
    systemsProgress,
    todaySystems,
    streak,
    totalCheckIns,
    achievements,
    dailyState,
    antiGoals,
    weeklyPriorities,
    visionLinkSummary,
  ] = await Promise.all([
    getActiveSystemsPeriodProgress(userId),
    getSystemsForToday(userId),
    db.streak.findFirst({
      where: { userId, type: "WEEKLY_CHECK_IN" },
    }),
    db.weeklyCheckIn.count({
      where: { planId: plan.id },
    }),
    db.achievement.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      take: 5,
    }),
    getDailyStateForDate(userId, todayYmd),
    db.antiGoal.findMany({
      where: { planId: plan.id },
      orderBy: { description: "asc" },
    }),
    getWeeklyPriorityProjects(userId, { weekNumber, year: weekYear }),
    getVisionMilestoneProjectSummary(userId),
  ])

  // Rotate one anti-goal per day so the "Held the line?" pill cycles
  // gently through them. Deterministic so every refresh shows the same one.
  const todayPrompt = getTodayPrompt(now, timeZone)
  const rotatingAntiGoal =
    antiGoals.length > 0
      ? antiGoals[todayPrompt.index % antiGoals.length]
      : null

  const month = now.getMonth()
  const currentQuarter =
    month < 3 ? "Q1" : month < 6 ? "Q2" : month < 9 ? "Q3" : "Q4"

  const projectStats = {
    total: plan.projects.length,
    completed: plan.projects.filter((g) => g.status === "COMPLETED").length,
    inProgress: plan.projects.filter(
      (g) => g.status === "IN_PROGRESS" || g.status === "ON_TRACK",
    ).length,
    atRisk: plan.projects.filter((g) => g.status === "AT_RISK").length,
    active: plan.projects.filter(
      (g) => g.status !== "COMPLETED" && g.status !== "ABANDONED",
    ).length,
  }

  const prevWeek = getPreviousIsoWeekContext(weekNumber, weekYear)
  // Reserved for future "did you complete last week?" hints — not used yet.
  void plan.weeklyCheckIns.find(
    (ci) => ci.weekNumber === prevWeek.weekNumber && ci.year === prevWeek.year,
  )

  const lastMood = plan.weeklyCheckIns[0]?.overallMood ?? null
  const prevMood = plan.weeklyCheckIns[1]?.overallMood ?? null

  return {
    plan: {
      id: plan.id,
      year: plan.year,
      status: plan.status,
      theme: getPlanTheme(plan.reflections),
    },
    /** Renamed from `goals` in Phase 2 to align with PARA. UI components use `data.projects` via the alias below. */
    projects: plan.projects,
    projectStats,
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
    /** Full list of today's active systems with per-row `isCompleted`. Used by `<TodayCard>`. */
    todaySystemsList: todaySystems.systems,
    /** YYYY-MM-DD in the user's timezone — needed for tap-to-complete writes. */
    todayYmd,
    /** User's timezone, exposed for client components that need date math. */
    timeZone,
    lastCheckIn: plan.weeklyCheckIns[0] ?? null,
    currentQuarter,
    currentWeek: weekNumber,
    trends: {
      totalCheckIns,
      lastMood,
      prevMood,
      moodDelta: lastMood && prevMood ? lastMood - prevMood : null,
    },
    /** Top 5 most recent achievements. Used by `<AchievementsBadge>`. */
    achievements,
    /** Today's DailyState row — `null` if the user hasn't touched today yet. */
    dailyState,
    /** Deterministic day-of-year prompt. Used by `<TodayCard>`. */
    todayPrompt,
    /** One rotating anti-goal pill for `<TodayCard>` — `null` if user has none. */
    rotatingAntiGoal,
    antiGoalCount: antiGoals.length,
    weeklyPriorities: weeklyPriorities ?? {
      weekNumber,
      year: weekYear,
      priorityProjectIds: [],
      projects: [],
      protectCategory: null,
    },
    visionLinkSummary,
  }
}

export type DashboardData = NonNullable<
  Awaited<ReturnType<typeof getDashboardData>>
>
