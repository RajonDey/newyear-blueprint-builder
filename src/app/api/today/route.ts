import { NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import {
  apiInvalidInput,
  apiNotFound,
  handleApiRoute,
  isApiError,
  parseJsonBody,
  requireApiSession,
} from "@/lib/api-route"
import { getYmdInTimeZone } from "@/lib/systems-period"
import {
  getDailyStateForDate,
  upsertDailyState,
} from "@/lib/queries/today"

const ymdSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")

const patchSchema = z.object({
  date: ymdSchema.optional(),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  energy: z.number().int().min(1).max(5).nullable().optional(),
  intention: z.string().max(2000).nullable().optional(),
  reflection: z.string().max(10_000).nullable().optional(),
  antiGoalHeldId: z.string().min(1).nullable().optional(),
  antiGoalHeld: z.boolean().nullable().optional(),
})

async function resolveTodayYmd(userId: string, override: string | null) {
  if (override) return override
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  return getYmdInTimeZone(new Date(), user?.timezone || "UTC")
}

async function assertAntiGoalOwned(userId: string, antiGoalId: string) {
  const row = await db.antiGoal.findFirst({
    where: { id: antiGoalId, plan: { userId } },
    select: { id: true },
  })
  return row != null
}

/**
 * GET /api/today?date=YYYY-MM-DD
 *
 * Returns the user's DailyState for that date (or `null` if untouched).
 * `date` defaults to today in the user's timezone.
 */
export async function GET(req: Request) {
  const session = await requireApiSession()
  if (isApiError(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const date = await resolveTodayYmd(
    session.userId,
    searchParams.get("date"),
  )
  const state = await getDailyStateForDate(session.userId, date)
  return NextResponse.json({ data: state, date })
}

/**
 * PATCH /api/today
 *
 * Body: `{ date?, mood?, energy?, intention?, reflection?, antiGoalHeldId?, antiGoalHeld? }`
 * Performs an `upsert` keyed on `(userId, date)`. Send only the fields you
 * want to change — undefined columns are preserved, null clears them.
 */
export async function PATCH(req: Request) {
  return handleApiRoute(async () => {
    const session = await requireApiSession()
    if (isApiError(session)) return session

    const body = await parseJsonBody(req)
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return apiInvalidInput(parsed.error.flatten())
    }

    if (parsed.data.antiGoalHeldId) {
      const owned = await assertAntiGoalOwned(
        session.userId,
        parsed.data.antiGoalHeldId,
      )
      if (!owned) {
        return apiNotFound("Anti-goal not found")
      }
    }

    const date = await resolveTodayYmd(
      session.userId,
      parsed.data.date ?? null,
    )

    let antiGoalHeldId = parsed.data.antiGoalHeldId
    let antiGoalHeld = parsed.data.antiGoalHeld

    if (antiGoalHeld === null && antiGoalHeldId === undefined) {
      antiGoalHeldId = null
    }

    if (antiGoalHeldId === null) {
      antiGoalHeld = null
    }

    const next = await upsertDailyState({
      userId: session.userId,
      ymd: date,
      mood: parsed.data.mood,
      energy: parsed.data.energy,
      intention: parsed.data.intention,
      reflection: parsed.data.reflection,
      antiGoalHeldId,
      antiGoalHeld,
    })
    return NextResponse.json({ data: next })
  })
}
