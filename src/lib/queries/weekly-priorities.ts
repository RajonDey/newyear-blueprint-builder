import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"

export type WeekContext = { weekNumber: number; year: number }

export type WeeklyPriorityProject = { id: string; title: string }

export type WeeklyPrioritySnapshot = {
  weekNumber: number
  year: number
  priorityProjectIds: string[]
  projects: WeeklyPriorityProject[]
  protectCategory: string | null
}

async function resolveWeekContext(
  userId: string,
  weekContext?: WeekContext,
): Promise<(WeekContext & { planId: string }) | null> {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })
  if (!plan) return null

  if (weekContext) {
    return { ...weekContext, planId: plan.id }
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const ctx = getIsoWeekContextInTimeZone(
    new Date(),
    user?.timezone || "UTC",
  )
  return { weekNumber: ctx.weekNumber, year: ctx.year, planId: plan.id }
}

/** Ordered priority project ids for a calendar week (empty when no weekly plan saved). */
export async function getWeeklyPriorityProjectIds(
  userId: string,
  weekContext?: WeekContext,
): Promise<string[]> {
  const resolved = await resolveWeekContext(userId, weekContext)
  if (!resolved) return []

  const wp = await db.weeklyPlan.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: resolved.planId,
        weekNumber: resolved.weekNumber,
        year: resolved.year,
      },
    },
    select: { priorityProjectIds: true },
  })

  return wp?.priorityProjectIds ? [...wp.priorityProjectIds] : []
}

/** Priority projects with titles, preserving weekly-plan order. */
export async function getWeeklyPriorityProjects(
  userId: string,
  weekContext?: WeekContext,
): Promise<WeeklyPrioritySnapshot | null> {
  const resolved = await resolveWeekContext(userId, weekContext)
  if (!resolved) return null

  const wp = await db.weeklyPlan.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: resolved.planId,
        weekNumber: resolved.weekNumber,
        year: resolved.year,
      },
    },
    select: { priorityProjectIds: true, protectCategory: true },
  })

  const priorityProjectIds = wp?.priorityProjectIds
    ? [...wp.priorityProjectIds]
    : []

  if (priorityProjectIds.length === 0) {
    return {
      weekNumber: resolved.weekNumber,
      year: resolved.year,
      priorityProjectIds: [],
      projects: [],
      protectCategory: wp?.protectCategory ?? null,
    }
  }

  const found = await db.project.findMany({
    where: { id: { in: priorityProjectIds }, planId: resolved.planId },
    select: { id: true, title: true },
  })
  const byId = new Map(found.map((p) => [p.id, p]))
  const projects = priorityProjectIds
    .map((id) => byId.get(id))
    .filter((p): p is WeeklyPriorityProject => p != null)

  return {
    weekNumber: resolved.weekNumber,
    year: resolved.year,
    priorityProjectIds,
    projects,
    protectCategory: wp?.protectCategory ?? null,
  }
}
