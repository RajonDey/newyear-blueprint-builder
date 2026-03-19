import { db } from "@/lib/db"

export async function getSystemsForToday(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
      completions: {
        where: { date: today },
        select: { id: true },
      },
    },
    orderBy: { goal: { sortOrder: "asc" } },
  })

  const completedIds = new Set(
    systems
      .filter((s) => s.completions.length > 0)
      .map((s) => s.id)
  )

  return {
    systems: systems.map(({ completions, ...s }) => ({
      ...s,
      isCompleted: completions.length > 0,
    })),
    completedIds,
    total: systems.length,
  }
}
