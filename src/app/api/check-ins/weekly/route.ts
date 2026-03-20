import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { getWeekNumber } from "@/lib/utils"

const createCheckInSchema = z.object({
  planId: z.string().min(1),
  overallMood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  nextWeekFocus: z.string().max(2000).optional(),
  goalCheckIns: z.array(
    z.object({
      goalId: z.string().min(1),
      progressRating: z.number().int().min(1).max(5),
      notes: z.string().max(1000).optional(),
      blockers: z.string().max(1000).optional(),
    })
  ),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const planId = searchParams.get("planId")
  const limit = parseInt(searchParams.get("limit") || "10")

  const checkIns = await db.weeklyCheckIn.findMany({
    where: {
      plan: { userId: session.user.id },
      ...(planId ? { planId } : {}),
    },
    include: { goalCheckIns: true },
    orderBy: { completedAt: "desc" },
    take: limit,
  })

  return NextResponse.json({ data: checkIns })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createCheckInSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const checkIn = await db.$transaction(async (tx) => {
    const created = await tx.weeklyCheckIn.create({
      data: {
        planId: parsed.data.planId,
        weekNumber,
        year,
        overallMood: parsed.data.overallMood,
        notes: parsed.data.notes,
        nextWeekFocus: parsed.data.nextWeekFocus?.trim() || null,
        goalCheckIns: {
          create: parsed.data.goalCheckIns,
        },
      },
      include: { goalCheckIns: true },
    })

    const prevWeek = weekNumber === 1 ? 52 : weekNumber - 1
    const prevYear = weekNumber === 1 ? year - 1 : year

    const hadPrevWeek = await tx.weeklyCheckIn.findFirst({
      where: {
        plan: { userId: session.user.id },
        weekNumber: prevWeek,
        year: prevYear,
      },
    })

    const streak = await tx.streak.findUnique({
      where: { userId_type: { userId: session.user.id, type: "WEEKLY_CHECK_IN" } },
    })

    const newCurrent = hadPrevWeek ? (streak?.currentStreak ?? 0) + 1 : 1
    const newLongest = Math.max(streak?.longestStreak ?? 0, newCurrent)

    await tx.streak.upsert({
      where: { userId_type: { userId: session.user.id, type: "WEEKLY_CHECK_IN" } },
      create: {
        userId: session.user.id,
        type: "WEEKLY_CHECK_IN",
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastCompletedAt: now,
      },
      update: {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastCompletedAt: now,
      },
    })

    const streakMilestones = [1, 4, 12, 26, 52]
    for (const m of streakMilestones) {
      if (newCurrent >= m) {
        const type = m === 1 ? "first_check_in" : `streak_${m}`
        await tx.achievement.upsert({
          where: { userId_type: { userId: session.user.id, type } },
          create: {
            userId: session.user.id,
            type,
            title: m === 1 ? "First Step" : `${m}-week streak`,
          },
          update: {},
        })
      }
    }

    return created
  })

  return NextResponse.json({ data: checkIn }, { status: 201 })
}
