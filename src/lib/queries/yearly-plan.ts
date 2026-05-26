import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import type { PlanTierKey } from "@/lib/config"
import { getPlanTheme } from "@/lib/yearly-plan/reflections"

export async function getActiveYearlyPlan(userId: string) {
  return db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: {
      id: true,
      year: true,
      status: true,
      reflections: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getYearlyPlanSettingsData(
  userId: string,
  planTier: PlanTierKey,
) {
  const limits = planLimits[planTier]

  const [activePlan, totalPlans, archivedPlans] = await Promise.all([
    getActiveYearlyPlan(userId),
    db.yearlyPlan.count({ where: { userId } }),
    db.yearlyPlan.findMany({
      where: { userId, status: { in: ["ARCHIVED", "COMPLETED"] } },
      select: {
        id: true,
        year: true,
        status: true,
        archivedAt: true,
        reflections: true,
      },
      orderBy: { year: "desc" },
      take: 5,
    }),
  ])

  let activeProjectCount = 0
  if (activePlan) {
    activeProjectCount = await db.project.count({
      where: {
        planId: activePlan.id,
        status: { notIn: ["COMPLETED", "ABANDONED"] },
      },
    })
  }

  const theme = activePlan ? getPlanTheme(activePlan.reflections) : null
  const canCreateNewYear =
    !activePlan && totalPlans < limits.maxPlans

  return {
    activePlan: activePlan
      ? {
          id: activePlan.id,
          year: activePlan.year,
          status: activePlan.status,
          theme,
          activeProjectCount,
        }
      : null,
    archivedPlans: archivedPlans.map((p) => ({
      id: p.id,
      year: p.year,
      status: p.status,
      archivedAt: p.archivedAt?.toISOString() ?? null,
      theme: getPlanTheme(p.reflections),
    })),
    totalPlans,
    maxPlans: limits.maxPlans,
    canCreateNewYear,
    planTier,
  }
}

export type YearlyPlanSettingsData = Awaited<
  ReturnType<typeof getYearlyPlanSettingsData>
>
