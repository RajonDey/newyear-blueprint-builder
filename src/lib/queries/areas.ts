import { db } from "@/lib/db"
import { GoalStatus } from "@prisma/client"
import { backfillOrphanProjectsForPlan } from "@/lib/areas/default-areas"
import {
  loadAreaHealthContext,
  resolveAreaHealth,
} from "@/lib/queries/area-health"

export type { AreaHealth } from "@/lib/queries/area-health"

/**
 * Area queries.
 *
 * `Area` is a PARA life-domain anchor that holds a user's `Project[]`. Six
 * default areas are seeded per user during onboarding / the Phase 2 migration.
 * Pro users can add custom areas; the limit is `planLimits.maxAreas`.
 */

export type AreaWithSummary = Awaited<ReturnType<typeof getAreasForUser>>[number]

/**
 * Returns every non-archived area for the user with the counters the
 * `/areas` grid needs (project count, on-track count, notes count).
 *
 * Projects are scoped to the user's active plan so the counters match what
 * the Projects surface shows. Inactive plans' projects don't inflate the
 * numbers.
 */
export async function getAreasForUser(userId: string) {
  const activePlan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })

  const areas = await db.area.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      projects: {
        where: activePlan ? { planId: activePlan.id } : { id: "__none__" },
        select: {
          id: true,
          title: true,
          status: true,
        },
        orderBy: [{ sortOrder: "asc" }],
      },
    },
  })

  if (activePlan) {
    await backfillOrphanProjectsForPlan(activePlan.id, userId)
    // Re-fetch project relations after backfill so counts match area detail.
    for (const area of areas) {
      area.projects = await db.project.findMany({
        where: { planId: activePlan.id, areaId: area.id },
        select: { id: true, title: true, status: true },
        orderBy: [{ sortOrder: "asc" }],
      })
    }
  }

  const areaIds = areas.map((a) => a.id)
  const noteCounts = areaIds.length
    ? await db.note.groupBy({
        by: ["parentId"],
        where: {
          userId,
          parentType: "AREA",
          parentId: { in: areaIds },
        },
        _count: { _all: true },
      })
    : []

  const noteCountByArea = new Map(
    noteCounts.map((row) => [row.parentId, row._count._all]),
  )

  const healthContext = await loadAreaHealthContext(activePlan?.id ?? null)

  return areas.map((a) => {
    const total = a.projects.length
    const onTrack = a.projects.filter(
      (p) =>
        p.status === GoalStatus.IN_PROGRESS ||
        p.status === GoalStatus.ON_TRACK,
    ).length
    const health = resolveAreaHealth(
      { id: a.id, category: a.category, projects: a.projects },
      healthContext,
    )
    return {
      id: a.id,
      name: a.name,
      color: a.color,
      icon: a.icon,
      description: a.description,
      category: a.category,
      isDefault: a.isDefault,
      sortOrder: a.sortOrder,
      projectCount: total,
      onTrackCount: onTrack,
      noteCount: noteCountByArea.get(a.id) ?? 0,
      topProjects: a.projects.slice(0, 3),
      moreProjects: Math.max(0, total - 3),
      health,
    }
  })
}

/** Get a single area + its projects for the active plan. */
export async function getAreaById(areaId: string, userId: string) {
  const area = await db.area.findFirst({
    where: { id: areaId, userId },
  })
  if (!area) return null

  const activePlan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true, year: true },
  })

  if (activePlan) {
    await backfillOrphanProjectsForPlan(activePlan.id, userId)
  }

  const projects = activePlan
    ? await db.project.findMany({
        where: { areaId: area.id, planId: activePlan.id },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          _count: {
            select: {
              tasks: true,
              systems: true,
              checkIns: true,
            },
          },
          tasks: {
            select: { id: true, status: true },
          },
          checkpoints: {
            select: { id: true, status: true },
          },
        },
      })
    : []

  return {
    area,
    projects: projects.map((p) => {
      const totalTasks = p._count.tasks
      const doneTasks = p.tasks.filter(
        (t) => t.status === GoalStatus.COMPLETED,
      ).length
      const totalCheckpoints = p.checkpoints.length
      const doneCheckpoints = p.checkpoints.filter(
        (c) => c.status === "COMPLETED",
      ).length
      const totalUnits = totalTasks + totalCheckpoints
      const doneUnits = doneTasks + doneCheckpoints
      const progress = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        type: p.type,
        status: p.status,
        progress,
        taskCount: totalTasks,
        systemCount: p._count.systems,
      }
    }),
    activePlanYear: activePlan?.year ?? null,
  }
}
