import { db } from "@/lib/db"
import type { LifeCategory, WheelOfLifeEntry } from "@prisma/client"
import { lifeCategoryOrder } from "@/lib/level-styles"

/**
 * Wheel of Life queries.
 *
 * The DB stores one `WheelOfLifeEntry` per `(plan, category, recordedAt)`.
 * The Wheel page works with the *latest* snapshot per category and an
 * ordered history of prior snapshots. We group entries by their week-of-year
 * to render the comparison radar + history table.
 */

export type WheelSnapshot = {
  /** ISO date of the snapshot (the most-recent entry's recordedAt). */
  recordedAt: Date
  /** YYYY-Www key used to group entries into the same "snapshot". */
  bucketKey: string
  /** Free-text note attached to the snapshot (we use the latest one). */
  note: string | null
  /** Per-category rating 1–10. Missing categories default to 0. */
  scores: Record<LifeCategory, number>
  /** Average across all six categories, rounded to 1 dp. */
  average: number
}

function bucketFor(date: Date): string {
  // Group entries that landed in the same ISO week. Cheap and stable.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}

function emptyScores(): Record<LifeCategory, number> {
  return {
    HEALTH: 0,
    CAREER: 0,
    FINANCE: 0,
    RELATIONSHIPS: 0,
    SPIRITUALITY: 0,
    PASSION: 0,
  }
}

/** Group rows into snapshots; newest snapshot last. */
function groupSnapshots(entries: WheelOfLifeEntry[]): WheelSnapshot[] {
  const buckets = new Map<string, { rows: WheelOfLifeEntry[] }>()
  for (const e of entries) {
    const key = bucketFor(e.recordedAt)
    const bucket = buckets.get(key) ?? { rows: [] }
    bucket.rows.push(e)
    buckets.set(key, bucket)
  }
  const out: WheelSnapshot[] = []
  for (const [key, { rows }] of buckets) {
    const scores = emptyScores()
    let latest = rows[0].recordedAt
    let note: string | null = null
    for (const r of rows) {
      scores[r.category] = r.rating
      if (r.recordedAt > latest) latest = r.recordedAt
      if (r.context) note = r.context
    }
    const filled = lifeCategoryOrder.map((c) => scores[c]).filter((v) => v > 0)
    const average =
      filled.length > 0
        ? Math.round((filled.reduce((s, v) => s + v, 0) / filled.length) * 10) / 10
        : 0
    out.push({ bucketKey: key, recordedAt: latest, note, scores, average })
  }
  out.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
  return out
}

/**
 * Fetch the full Wheel surface payload for the user's active plan.
 *
 * Returns `null` only if the user has no active plan at all — caller falls
 * back to an empty-state CTA pointing at `/onboarding`.
 */
export async function getWheelForUser(userId: string) {
  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true, year: true },
  })
  if (!plan) return null

  const entries = await db.wheelOfLifeEntry.findMany({
    where: { planId: plan.id },
    orderBy: { recordedAt: "asc" },
  })

  const snapshots = groupSnapshots(entries)
  const latest = snapshots[snapshots.length - 1] ?? null
  const previous = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null

  return {
    planId: plan.id,
    planYear: plan.year,
    latest,
    previous,
    history: snapshots,
  }
}
