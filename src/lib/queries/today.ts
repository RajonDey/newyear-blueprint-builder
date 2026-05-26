import { db } from "@/lib/db"
import type { DailyState } from "@prisma/client"
import { summarizeAntiGoalHeldRows } from "@/lib/daily-state/anti-goal-held"

/**
 * DailyState queries — the "Today depth" layer on top of `<TodayCard>`.
 *
 * Each row is `(userId, date)` unique. `date` is a SQL `@db.Date` (no time
 * component) so writes from different timezones never collide.
 *
 * We always work in **YYYY-MM-DD** strings at the boundary because the user's
 * "today" depends on their timezone, not the server's. `parseYmdToUtcMidnight`
 * coerces the string back to a `Date` Prisma will accept.
 */

/** Coerce `YYYY-MM-DD` to a UTC midnight `Date` — what Prisma's `@db.Date` stores. */
function parseYmdToUtcMidnight(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((s) => parseInt(s, 10))
  return new Date(Date.UTC(y, m - 1, d))
}

export async function getDailyStateForDate(
  userId: string,
  ymd: string,
): Promise<DailyState | null> {
  const date = parseYmdToUtcMidnight(ymd)
  return db.dailyState.findUnique({
    where: { userId_date: { userId, date } },
  })
}

/**
 * Upsert helper for `<TodayCard>`'s autosave. Only persists the fields
 * provided; nulls and `undefined` are distinguished:
 *   - `undefined` → leave the column unchanged
 *   - `null`      → explicitly clear the column
 *
 * Returns the final row so the caller can echo the saved state back to the
 * client (debounced autosave needs the new `updatedAt` to detect conflicts).
 */
export async function upsertDailyState(args: {
  userId: string
  ymd: string
  mood?: number | null
  energy?: number | null
  intention?: string | null
  reflection?: string | null
  antiGoalHeldId?: string | null
  antiGoalHeld?: boolean | null
}): Promise<DailyState> {
  const date = parseYmdToUtcMidnight(args.ymd)
  const update: Record<string, unknown> = {}
  if (args.mood !== undefined) update.mood = args.mood
  if (args.energy !== undefined) update.energy = args.energy
  if (args.intention !== undefined) update.intention = args.intention
  if (args.reflection !== undefined) update.reflection = args.reflection
  if (args.antiGoalHeldId !== undefined) {
    update.antiGoalHeldId = args.antiGoalHeldId
  }
  if (args.antiGoalHeld !== undefined) update.antiGoalHeld = args.antiGoalHeld

  return db.dailyState.upsert({
    where: { userId_date: { userId: args.userId, date } },
    create: {
      userId: args.userId,
      date,
      mood: args.mood ?? null,
      energy: args.energy ?? null,
      intention: args.intention ?? null,
      reflection: args.reflection ?? null,
      antiGoalHeldId: args.antiGoalHeldId ?? null,
      antiGoalHeld: args.antiGoalHeld ?? null,
    },
    update,
  })
}

/** PC-20 hook — held/slipped counts from first-class columns (post backfill). */
export async function getAntiGoalHeldStatsForUser(
  userId: string,
  sinceYmd: string,
) {
  const since = parseYmdToUtcMidnight(sinceYmd)
  const rows = await db.dailyState.findMany({
    where: {
      userId,
      date: { gte: since },
      antiGoalHeld: { not: null },
    },
    select: { antiGoalHeld: true },
  })
  return summarizeAntiGoalHeldRows(rows)
}
