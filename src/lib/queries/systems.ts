import { subDays } from "date-fns"
import type { Frequency, LifeCategory } from "@prisma/client"
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
      projects: {
        select: {
          systems: {
            where: { isActive: true },
            select: { id: true, frequency: true },
          },
        },
      },
    },
  })

  const activeSystems =
    plan?.projects.flatMap((g) => g.systems) ?? []
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

  const systems = await db.system.findMany({
    where: {
      project: { planId: plan.id },
      isActive: true,
    },
    include: {
      project: { select: { id: true, title: true, category: true } },
    },
    orderBy: { project: { sortOrder: "asc" } },
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
      project: s.project,
      /** @deprecated UI compat alias — readers should switch to `project`. */
      goal: s.project,
      isCompleted,
    }
  })

  return {
    systems: rows,
    completedIds,
    total: systems.length,
  }
}

/* ------------------------------------------------------------------ */
/*  Systems — management view (`/systems` top-level page)             */
/* ------------------------------------------------------------------ */

export type SystemRow = {
  id: string
  description: string
  frequency: Frequency
  isActive: boolean
  project: {
    id: string
    title: string
    category: LifeCategory
    areaId: string | null
    areaName: string | null
  }
  /** Consecutive prior periods completed, stopping at the first miss. */
  currentStreak: number
  /** 7-day completion ratio for DAILY, 4-week for WEEKLY/MONTHLY. */
  consistencyPct: number
  /** ISO dates of the last 28 completion ymds (newest last). */
  recent: string[]
}

export type SystemsManagementData = {
  hasActivePlan: boolean
  active: SystemRow[]
  archived: SystemRow[]
  insights: {
    driftingCount: number
    mostConsistent: { systemId: string; description: string; pct: number } | null
  }
}

/**
 * Returns every system on the user's active plan with per-row streak +
 * 28-day completion data. Powers the `/systems` management page and is also
 * cheap enough to call from the dashboard if/when we want a "systems at a
 * glance" card there.
 */
export async function getSystemsManagement(
  userId: string,
): Promise<SystemsManagementData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const timeZone = user?.timezone || "UTC"

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })

  if (!plan) {
    return {
      hasActivePlan: false,
      active: [],
      archived: [],
      insights: { driftingCount: 0, mostConsistent: null },
    }
  }

  const systems = await db.system.findMany({
    where: { project: { planId: plan.id } },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          category: true,
          areaId: true,
          area: { select: { name: true } },
        },
      },
    },
    orderBy: [{ isActive: "desc" }, { id: "asc" }],
  })

  if (systems.length === 0) {
    return {
      hasActivePlan: true,
      active: [],
      archived: [],
      insights: { driftingCount: 0, mostConsistent: null },
    }
  }

  const systemIds = systems.map((s) => s.id)
  const since = subDays(new Date(), 28)
  const completions = await db.systemCompletion.findMany({
    where: {
      systemId: { in: systemIds },
      date: { gte: since },
    },
    select: { systemId: true, date: true },
    orderBy: { date: "asc" },
  })

  const ymdsBySystem = new Map<string, string[]>()
  for (const c of completions) {
    const ymd = getYmdInTimeZone(c.date, timeZone)
    const list = ymdsBySystem.get(c.systemId) ?? []
    list.push(ymd)
    ymdsBySystem.set(c.systemId, list)
  }

  const todayYmd = getYmdInTimeZone(new Date(), timeZone)
  const active: SystemRow[] = []
  const archived: SystemRow[] = []
  let bestPct = -1
  let bestRow: SystemRow | null = null
  let driftingCount = 0

  for (const s of systems) {
    const ymds = ymdsBySystem.get(s.id) ?? []
    const recentSet = new Set(ymds)
    const windowDays = s.frequency === "DAILY" ? 7 : 28
    let completedInWindow = 0
    for (let i = 0; i < windowDays; i++) {
      const date = subDays(new Date(), i)
      const ymd = getYmdInTimeZone(date, timeZone)
      if (
        isSystemCompletedForPeriod(s.frequency, ymd, [...recentSet])
      ) {
        completedInWindow += 1
      }
    }
    const pct =
      windowDays > 0 ? Math.round((completedInWindow / windowDays) * 100) : 0

    // Streak: walk backwards from today, stop at the first miss.
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const date = subDays(new Date(), i)
      const ymd = getYmdInTimeZone(date, timeZone)
      if (isSystemCompletedForPeriod(s.frequency, ymd, [...recentSet])) {
        streak += 1
      } else {
        break
      }
    }

    const row: SystemRow = {
      id: s.id,
      description: s.description,
      frequency: s.frequency,
      isActive: s.isActive,
      project: {
        id: s.project.id,
        title: s.project.title,
        category: s.project.category,
        areaId: s.project.areaId,
        areaName: s.project.area?.name ?? null,
      },
      currentStreak: streak,
      consistencyPct: pct,
      recent: ymds.slice(-28),
    }

    if (s.isActive) {
      active.push(row)
      if (pct < 50) driftingCount += 1
      if (pct > bestPct) {
        bestPct = pct
        bestRow = row
      }
    } else {
      archived.push(row)
    }
  }

  void todayYmd

  return {
    hasActivePlan: true,
    active,
    archived,
    insights: {
      driftingCount,
      mostConsistent:
        bestRow && bestPct > 0
          ? {
              systemId: bestRow.id,
              description: bestRow.description,
              pct: bestPct,
            }
          : null,
    },
  }
}
