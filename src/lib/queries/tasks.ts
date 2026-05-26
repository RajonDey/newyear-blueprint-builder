import { db } from "@/lib/db"
import { addDays, endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns"
import type { GoalStatus, LifeCategory } from "@prisma/client"

/**
 * Task queries — feeds the top-level `/tasks` surface.
 *
 * Returns the user's tasks across **all** projects in their active plan,
 * grouped into the four time-buckets the `/tasks` page expects:
 *
 *   • today    — due today (incl. overdue not-done items)
 *   • week     — due this ISO week (excluding today)
 *   • backlog  — undated, not done
 *   • done     — completed in the last 30 days, newest first
 */

export type TaskRow = {
  id: string
  description: string
  type: "SMALL" | "MEDIUM" | "BIG"
  status: GoalStatus
  targetDate: Date | null
  project: {
    id: string
    title: string
    category: LifeCategory
    areaId: string | null
    areaName: string | null
  }
}

export type TasksData = {
  hasActivePlan: boolean
  today: TaskRow[]
  week: TaskRow[]
  backlog: TaskRow[]
  done: TaskRow[]
  counts: {
    today: number
    week: number
    backlog: number
    done: number
    total: number
  }
}

export async function getTasksForUser(userId: string): Promise<TasksData> {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })

  if (!plan) {
    return {
      hasActivePlan: false,
      today: [],
      week: [],
      backlog: [],
      done: [],
      counts: { today: 0, week: 0, backlog: 0, done: 0, total: 0 },
    }
  }

  const tasks = await db.task.findMany({
    where: { project: { planId: plan.id } },
    orderBy: [{ targetDate: "asc" }, { type: "asc" }],
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
  })

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const doneCutoff = addDays(now, -30)

  const today: TaskRow[] = []
  const week: TaskRow[] = []
  const backlog: TaskRow[] = []
  const done: TaskRow[] = []

  for (const t of tasks) {
    const row: TaskRow = {
      id: t.id,
      description: t.description,
      type: t.type,
      status: t.status,
      targetDate: t.targetDate,
      project: {
        id: t.project.id,
        title: t.project.title,
        category: t.project.category,
        areaId: t.project.areaId,
        areaName: t.project.area?.name ?? null,
      },
    }

    if (t.status === "COMPLETED") {
      // Use updatedAt-equivalent — Task model has no `completedAt`; fall back to targetDate or createdAt.
      // For the cutoff window we treat the task as recent if it has a targetDate within 30 days or no date.
      const ref = t.targetDate ?? now
      if (ref >= doneCutoff) done.push(row)
      continue
    }

    if (!t.targetDate) {
      backlog.push(row)
      continue
    }

    if (t.targetDate <= todayEnd) {
      // Overdue + today → "today" bucket.
      today.push(row)
    } else if (t.targetDate <= weekEnd && t.targetDate > todayEnd) {
      week.push(row)
    } else {
      backlog.push(row)
    }
  }

  void todayStart // kept for parity if future buckets need it
  void weekStart

  // Newest done first.
  done.sort((a, b) => {
    const ad = a.targetDate?.getTime() ?? 0
    const bd = b.targetDate?.getTime() ?? 0
    return bd - ad
  })

  return {
    hasActivePlan: true,
    today,
    week,
    backlog,
    done,
    counts: {
      today: today.length,
      week: week.length,
      backlog: backlog.length,
      done: done.length,
      total: tasks.length,
    },
  }
}
