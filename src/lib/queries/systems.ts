import { subDays } from "date-fns"
import { db } from "@/lib/db"
import {
  getYmdInTimeZone,
  isSystemCompletedForPeriod,
} from "@/lib/systems-period"

/** Shared rules for dashboard + "perfect day" — uses user timezone. */
export async function getActiveSystemsPeriodProgress(userId: string): Promise<{
  completed: number
  total: number
  activeSystemIds: string[]
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const timeZone = user?.timezone || "UTC"
  const todayYmd = getYmdInTimeZone(new Date(), timeZone)

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: {
      goals: {
        select: {
          dailySystems: {
            where: { isActive: true },
            select: { id: true, frequency: true },
          },
        },
      },
    },
  })

  const activeSystems =
    plan?.goals.flatMap((g) => g.dailySystems) ?? []
  const activeSystemIds = activeSystems.map((s) => s.id)

  if (activeSystemIds.length === 0) {
    return { completed: 0, total: 0, activeSystemIds: [] }
  }

  const since = subDays(new Date(), 120)
  const recentCompletions = await db.systemCompletion.findMany({
    where: {
      systemId: { in: activeSystemIds },
      date: { gte: since },
    },
    select: { systemId: true, date: true },
  })

  const ymdsBySystem = new Map<string, string[]>()
  for (const c of recentCompletions) {
    const ymd = getYmdInTimeZone(c.date, timeZone)
    const list = ymdsBySystem.get(c.systemId) ?? []
    list.push(ymd)
    ymdsBySystem.set(c.systemId, list)
  }

  let completed = 0
  for (const s of activeSystems) {
    const ymds = ymdsBySystem.get(s.id) ?? []
    if (isSystemCompletedForPeriod(s.frequency, todayYmd, ymds)) {
      completed += 1
    }
  }

  return {
    completed,
    total: activeSystemIds.length,
    activeSystemIds,
  }
}

export async function getSystemsForToday(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const timeZone = user?.timezone || "UTC"
  const todayYmd = getYmdInTimeZone(new Date(), timeZone)

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })

  if (!plan) return { systems: [], completedIds: new Set<string>(), total: 0 }

  const systems = await db.dailySystem.findMany({
    where: {
      goal: { planId: plan.id },
      isActive: true,
    },
    include: {
      goal: { select: { id: true, title: true, category: true } },
    },
    orderBy: { goal: { sortOrder: "asc" } },
  })

  if (systems.length === 0) {
    return { systems: [], completedIds: new Set<string>(), total: 0 }
  }

  const systemIds = systems.map((s) => s.id)
  const since = subDays(new Date(), 120)

  const recentCompletions = await db.systemCompletion.findMany({
    where: {
      systemId: { in: systemIds },
      date: { gte: since },
    },
    select: { systemId: true, date: true },
  })

  const ymdsBySystem = new Map<string, string[]>()
  for (const c of recentCompletions) {
    const ymd = getYmdInTimeZone(c.date, timeZone)
    const list = ymdsBySystem.get(c.systemId) ?? []
    list.push(ymd)
    ymdsBySystem.set(c.systemId, list)
  }

  const completedIds = new Set<string>()
  const rows = systems.map((s) => {
    const ymds = ymdsBySystem.get(s.id) ?? []
    const isCompleted = isSystemCompletedForPeriod(
      s.frequency,
      todayYmd,
      ymds
    )
    if (isCompleted) completedIds.add(s.id)
    return {
      id: s.id,
      description: s.description,
      frequency: s.frequency,
      isActive: s.isActive,
      goal: s.goal,
      isCompleted,
    }
  })

  return {
    systems: rows,
    completedIds,
    total: systems.length,
  }
}
