import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { getIsoWeekContextInTimeZone, getPreviousIsoWeekContext } from "@/lib/utils"
import {
  apiInvalidInput,
  apiList,
  apiNotFound,
  handleApiRoute,
  isApiError,
  paginationMeta,
  parseJsonBody,
  parsePagination,
  requireApiSession,
} from "@/lib/api-route"

const createCheckInSchema = z.object({
  planId: z.string().min(1),
  overallMood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(2000).optional(),
  nextWeekFocus: z.string().max(2000).optional(),
  projectCheckIns: z.array(
    z.object({
      projectId: z.string().min(1),
      progressRating: z.number().int().min(1).max(5),
      notes: z.string().max(1000).optional(),
      blockers: z.string().max(1000).optional(),
    }),
  ),
})

export async function GET(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const { searchParams } = new URL(req.url)
    const planId = searchParams.get("planId")
    const { page, limit, skip } = parsePagination(searchParams, {
      limit: 10,
      maxLimit: 100,
    })

    const where = {
      plan: { userId: session.userId },
      ...(planId ? { planId } : {}),
    }

    const [checkIns, total] = await Promise.all([
      db.weeklyCheckIn.findMany({
        where,
        include: { projectCheckIns: true },
        orderBy: { completedAt: "desc" },
        skip,
        take: limit,
      }),
      db.weeklyCheckIn.count({ where }),
    ])

    return apiList(checkIns, paginationMeta(total, page, limit))
  })
}

export async function POST(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = createCheckInSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    const plan = await db.yearlyPlan.findFirst({
      where: { id: parsed.data.planId, userId: session.userId },
      select: { id: true, user: { select: { timezone: true } } },
    })
    if (!plan) {
      return apiNotFound("Plan not found")
    }

    const allowedGoalIds = new Set(
      (
        await db.project.findMany({
          where: { planId: plan.id },
          select: { id: true },
        })
      ).map((g) => g.id),
    )
    if (parsed.data.projectCheckIns.some((gc) => !allowedGoalIds.has(gc.projectId))) {
      return NextResponse.json(
        { error: "Project check-ins must belong to projects on this plan." },
        { status: 400 },
      )
    }

    const now = new Date()
    const { weekNumber, year } = getIsoWeekContextInTimeZone(
      now,
      plan.user.timezone || "UTC",
    )

    const safeNotes = sanitizeRichTextHtml(parsed.data.notes)
    const safeNextWeekFocus = sanitizeRichTextHtml(parsed.data.nextWeekFocus)
    const safeGoalCheckIns = parsed.data.projectCheckIns.map((g) => ({
      ...g,
      notes: sanitizeRichTextHtml(g.notes) || undefined,
      blockers: sanitizeRichTextHtml(g.blockers) || undefined,
    }))

    const result = await db.$transaction(async (tx) => {
      const existing = await tx.weeklyCheckIn.findUnique({
        where: {
          planId_weekNumber_year: {
            planId: plan.id,
            weekNumber,
            year,
          },
        },
        select: { id: true },
      })

      if (existing) {
        await tx.weeklyCheckIn.update({
          where: { id: existing.id },
          data: {
            overallMood: parsed.data.overallMood,
            notes: safeNotes || null,
            nextWeekFocus: safeNextWeekFocus || null,
          },
        })
        await tx.projectCheckIn.deleteMany({
          where: { weeklyCheckInId: existing.id },
        })
        if (safeGoalCheckIns.length > 0) {
          await tx.projectCheckIn.createMany({
            data: safeGoalCheckIns.map((g) => ({
              weeklyCheckInId: existing.id,
              projectId: g.projectId,
              progressRating: g.progressRating,
              notes: g.notes ?? null,
              blockers: g.blockers ?? null,
            })),
          })
        }

        const updated = await tx.weeklyCheckIn.findUnique({
          where: { id: existing.id },
          include: { projectCheckIns: true },
        })
        const streak = await tx.streak.findUnique({
          where: {
            userId_type: { userId: session.userId, type: "WEEKLY_CHECK_IN" },
          },
        })

        return {
          checkIn: updated!,
          streak: streak?.currentStreak ?? 0,
          newAchievements: [] as string[],
          isUpdate: true,
        }
      }

      const created = await tx.weeklyCheckIn.create({
        data: {
          planId: plan.id,
          weekNumber,
          year,
          overallMood: parsed.data.overallMood,
          notes: safeNotes || null,
          nextWeekFocus: safeNextWeekFocus || null,
          projectCheckIns: {
            create: safeGoalCheckIns,
          },
        },
        include: { projectCheckIns: true },
      })

      const { weekNumber: prevWeek, year: prevYear } = getPreviousIsoWeekContext(
        weekNumber,
        year,
      )

      const hadPrevWeek = await tx.weeklyCheckIn.findFirst({
        where: {
          plan: { userId: session.userId },
          weekNumber: prevWeek,
          year: prevYear,
        },
      })

      const streakRow = await tx.streak.findUnique({
        where: {
          userId_type: { userId: session.userId, type: "WEEKLY_CHECK_IN" },
        },
      })

      const newCurrent = hadPrevWeek ? (streakRow?.currentStreak ?? 0) + 1 : 1
      const newLongest = Math.max(streakRow?.longestStreak ?? 0, newCurrent)

      await tx.streak.upsert({
        where: {
          userId_type: { userId: session.userId, type: "WEEKLY_CHECK_IN" },
        },
        create: {
          userId: session.userId,
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
          const existingAchievement = await tx.achievement.findUnique({
            where: { userId_type: { userId: session.userId, type } },
          })
          if (!existingAchievement) {
            await tx.achievement.create({
              data: {
                userId: session.userId,
                type,
                title: m === 1 ? "First Step" : `${m}-week streak`,
              },
            })
            newAchievements.push(type)
          }
        }
      }

      return {
        checkIn: created,
        streak: newCurrent,
        newAchievements,
        isUpdate: false,
      }
    })

    return NextResponse.json(
      {
        data: result.checkIn,
        streak: result.streak,
        newAchievements: result.newAchievements,
      },
      { status: result.isUpdate ? 200 : 201 },
    )
  })
}
