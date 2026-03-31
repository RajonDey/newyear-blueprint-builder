import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { getIsoWeekContextInTimeZone, getPreviousIsoWeekContext } from "@/lib/utils"

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

  const plan = await db.yearlyPlan.findFirst({
    where: { id: parsed.data.planId, userId: session.user.id },
    select: { id: true, user: { select: { timezone: true } } },
  })
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  const allowedGoalIds = new Set(
    (
      await db.goal.findMany({
        where: { planId: plan.id },
        select: { id: true },
      })
    ).map((g) => g.id)
  )
  if (parsed.data.goalCheckIns.some((gc) => !allowedGoalIds.has(gc.goalId))) {
    return NextResponse.json(
      { error: "Goal check-ins must belong to goals on this plan." },
      { status: 400 }
    )
  }

  const now = new Date()
  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    now,
    plan.user.timezone || "UTC"
  )

  const safeNotes = sanitizeRichTextHtml(parsed.data.notes)
  const safeNextWeekFocus = sanitizeRichTextHtml(parsed.data.nextWeekFocus)
  const safeGoalCheckIns = parsed.data.goalCheckIns.map((g) => ({
    ...g,
    notes: sanitizeRichTextHtml(g.notes) || undefined,
    blockers: sanitizeRichTextHtml(g.blockers) || undefined,
  }))

  const checkIn = await db.$transaction(async (tx) => {
    const created = await tx.weeklyCheckIn.create({
      data: {
        planId: plan.id,
        weekNumber,
        year,
        overallMood: parsed.data.overallMood,
        notes: safeNotes || null,
        nextWeekFocus: safeNextWeekFocus || null,
        goalCheckIns: {
          create: safeGoalCheckIns,
        },
      },
      include: { goalCheckIns: true },
    })

    const { weekNumber: prevWeek, year: prevYear } = getPreviousIsoWeekContext(
      weekNumber,
      year
    )

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
    const newAchievements: string[] = []
    for (const m of streakMilestones) {
      if (newCurrent >= m) {
        const type = m === 1 ? "first_check_in" : `streak_${m}`
        const existing = await tx.achievement.findUnique({
          where: { userId_type: { userId: session.user.id, type } },
        })
        if (!existing) {
          await tx.achievement.create({
            data: {
              userId: session.user.id,
              type,
              title: m === 1 ? "First Step" : `${m}-week streak`,
            },
          })
          newAchievements.push(type)
        }
      }
    }

    return { created, newAchievements, streak: newCurrent }
  })

  return NextResponse.json(
    {
      data: checkIn.created,
      streak: checkIn.streak,
      newAchievements: checkIn.newAchievements,
    },
    { status: 201 }
  )
}
