import { db } from "@/lib/db"

export async function getProjectsByPlan(planId: string, userId: string) {
  return db.project.findMany({
    where: { planId, plan: { userId } },
    include: {
      area: { select: { id: true, name: true, color: true } },
      checkpoints: { orderBy: { quarter: "asc" } },
      systems: true,
      motivation: true,
      tasks: { select: { id: true, status: true } },
      _count: { select: { checkIns: true, tasks: true } },
    },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  })
}

export async function getProjectById(projectId: string, userId: string) {
  return db.project.findFirst({
    where: { id: projectId, plan: { userId } },
    include: {
      plan: { select: { id: true, year: true, status: true } },
      area: { select: { id: true, name: true, color: true } },
      visionItem: { select: { id: true, title: true, kind: true } },
      checkpoints: { orderBy: { quarter: "asc" } },
      systems: {
        include: {
          completions: { orderBy: { date: "desc" }, take: 30 },
        },
      },
      motivation: true,
      tasks: { orderBy: [{ status: "asc" }, { type: "asc" }] },
      checkIns: {
        orderBy: { weeklyCheckIn: { completedAt: "desc" } },
        take: 20,
        include: {
          weeklyCheckIn: {
            select: { weekNumber: true, year: true, completedAt: true },
          },
        },
      },
      keyResults: { orderBy: { sortOrder: "asc" } },
    },
  })
}

export async function getProjectsForUser(userId: string) {
  const activePlan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true, year: true },
  })

  if (!activePlan) {
    return {
      projects: [] as Awaited<ReturnType<typeof getProjectsByPlan>>,
      activePlanYear: null as number | null,
    }
  }

  const projects = await getProjectsByPlan(activePlan.id, userId)
  return { projects, activePlanYear: activePlan.year }
}
