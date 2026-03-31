import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getActiveSystemsPeriodProgress } from "@/lib/queries/systems"
import { z } from "zod"

const completeSchema = z.object({
  systemId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = completeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { systemId, date, completed } = parsed.data
  const dateObj = new Date(date + "T00:00:00.000Z")

  const system = await db.dailySystem.findFirst({
    where: {
      id: systemId,
      goal: { plan: { userId: session.user.id } },
    },
  })

  if (!system) {
    return NextResponse.json({ error: "System not found" }, { status: 404 })
  }

  if (completed) {
    await db.systemCompletion.upsert({
      where: {
        systemId_date: { systemId, date: dateObj },
      },
      create: { systemId, date: dateObj },
      update: {},
    })
  } else {
    await db.systemCompletion.deleteMany({
      where: { systemId, date: dateObj },
    })
  }

  const progress = await getActiveSystemsPeriodProgress(session.user.id)
  const allDone =
    progress.completed === progress.total && progress.total > 0

  if (allDone) {
    await db.achievement.upsert({
      where: {
        userId_type: { userId: session.user.id, type: "all_systems_day" },
      },
      create: {
        userId: session.user.id,
        type: "all_systems_day",
        title: "Perfect Day",
      },
      update: {},
    })

    const existing = await db.streak.findUnique({
      where: {
        userId_type: { userId: session.user.id, type: "DAILY_SYSTEM" },
      },
    })

    const today = date
    const yesterday = new Date(dateObj.getTime() - 86_400_000)
      .toISOString()
      .slice(0, 10)

    const lastDate = existing?.lastCompletedAt
      ?.toISOString()
      .slice(0, 10)

    const isContinuation = lastDate === yesterday || lastDate === today
    const newCurrent = isContinuation ? (existing?.currentStreak ?? 0) + 1 : 1

    await db.streak.upsert({
      where: {
        userId_type: { userId: session.user.id, type: "DAILY_SYSTEM" },
      },
      create: {
        userId: session.user.id,
        type: "DAILY_SYSTEM",
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedAt: dateObj,
      },
      update: {
        currentStreak: newCurrent,
        longestStreak: Math.max(newCurrent, existing?.longestStreak ?? 0),
        lastCompletedAt: dateObj,
      },
    })
  }

  return NextResponse.json({
    data: { completed, allSystemsDone: allDone },
  })
}
