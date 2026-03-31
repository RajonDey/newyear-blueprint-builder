import { db } from "@/lib/db"
import { getIsoWeekContext } from "@/lib/utils"

export async function getAdminDashboardStats() {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const [totalUsers, proCount, activeSubscriptions, checkInsThisWeek, newUsersThisWeek] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { planTier: "PRO" } }),
      db.subscription.count({ where: { status: "ACTIVE" } }),
      db.weeklyCheckIn.count({
        where: { completedAt: { gte: weekStart } },
      }),
      db.user.count({
        where: { createdAt: { gte: weekStart } },
      }),
    ])

  return {
    totalUsers,
    proCount,
    activeSubscriptions,
    checkInsThisWeek,
    newUsersThisWeek,
  }
}

export async function getAdminUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    db.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        planTier: true,
        role: true,
        createdAt: true,
        _count: { select: { yearlyPlans: true } },
      },
    }),
    db.user.count(),
  ])

  return { users, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getAdminSubscriptions(page = 1, limit = 20) {
  const skip = (page - 1) * limit

  const [subscriptions, total] = await Promise.all([
    db.subscription.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db.subscription.count(),
  ])

  return { subscriptions, total, page, totalPages: Math.ceil(total / limit) }
}

export async function getAdminAnalytics() {
  const now = new Date()
  const { weekNumber: currentWeek, year: currentYear } = getIsoWeekContext(now)

  const twelveMonthsAgo = new Date(now)
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const [usersByMonth, plansByYear, checkInsByWeek] = await Promise.all([
    db.user
      .findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      })
      .then((users) => {
        const byMonth = new Map<string, number>()
        for (const u of users) {
          const m = u.createdAt.toISOString().slice(0, 7)
          byMonth.set(m, (byMonth.get(m) ?? 0) + 1)
        }
        return Array.from(byMonth.entries())
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => a.month.localeCompare(b.month))
      }),
    db.yearlyPlan.groupBy({
      by: ["year"],
      _count: { id: true },
      orderBy: { year: "desc" },
      take: 5,
    }),
    db.weeklyCheckIn.groupBy({
      by: ["year", "weekNumber"],
      _count: { id: true },
      where: {
        year: currentYear,
        weekNumber: { gte: Math.max(1, currentWeek - 12) },
      },
      orderBy: [{ year: "asc" }, { weekNumber: "asc" }],
    }),
  ])

  return {
    usersByMonth,
    plansByYear,
    checkInsByWeek,
  }
}
