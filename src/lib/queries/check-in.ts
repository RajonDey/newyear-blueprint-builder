import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"

export async function getCheckInFormData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const now = new Date()
  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    now,
    user?.timezone || "UTC"
  )

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      projects: {
        where: { status: { not: "COMPLETED" } },
        select: { id: true, title: true, category: true },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      },
    },
  })

  if (!plan) return null

  const existingCheckIn = await db.weeklyCheckIn.findUnique({
    where: {
      planId_weekNumber_year: {
        planId: plan.id,
        weekNumber,
        year,
      },
    },
    include: { projectCheckIns: true },
  })

  return {
    plan: { id: plan.id, year: plan.year },
    /** PARA-aligned name. Old callers can still read `data.projects` via the alias. */
    projects: plan.projects,
    weekNumber,
    year,
    existingCheckIn,
  }
}
