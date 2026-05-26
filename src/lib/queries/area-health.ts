import type { GoalStatus, LifeCategory } from "@prisma/client"
import { db } from "@/lib/db"
import { lifeCategoryOrder } from "@/lib/level-styles"

export type AreaHealthTone = "quiet" | "green" | "amber"

export type AreaHealth = {
  /** 0–100 composite; null when the area has no active projects (quiet). */
  score: number | null
  tone: AreaHealthTone
  /** Human-readable summary for cards and tooltips. */
  label: string
}

export type AreaHealthContext = {
  weeklyAvgByAreaId: Map<string, number>
  wheelDeltaByCategory: Map<LifeCategory, number>
}

const PROJECT_STATUS_SCORE: Record<GoalStatus, number> = {
  ON_TRACK: 100,
  IN_PROGRESS: 85,
  NOT_STARTED: 55,
  AT_RISK: 35,
  COMPLETED: 100,
  ABANDONED: 20,
}

/**
 * Area health composite (0–100). Transparent weights — not ML.
 *
 * Weights apply only when the area has at least one project on the active plan:
 *
 * - **50% project pulse** — mean status score for non-abandoned projects
 *   (`ON_TRACK`=100, `IN_PROGRESS`=85, `NOT_STARTED`=55, `AT_RISK`=35, …)
 * - **35% weekly rhythm** — mean `ProjectCheckIn.progressRating` (1–5) from the
 *   last four weekly reviews for projects in this area, scaled to 0–100.
 *   Defaults to **60** when no ratings exist yet (neutral, not punitive).
 * - **15% wheel momentum** — latest minus previous Wheel rating for the area's
 *   `LifeCategory` (typically −9…+9). Mapped to 0–100 around a 50 baseline.
 *   Defaults to **50** when the area has no category or fewer than two snapshots.
 *
 * **Tone:** `quiet` (zero projects), `green` (score ≥ 65), `amber` (score < 65).
 */
export function computeAreaHealth(input: {
  projects: { status: GoalStatus }[]
  category: LifeCategory | null
  weeklyAvgRating: number | null
  wheelDelta: number | null
}): AreaHealth {
  const activeProjects = input.projects.filter((p) => p.status !== "ABANDONED")

  if (activeProjects.length === 0) {
    return {
      score: null,
      tone: "quiet",
      label: "Quiet — no projects yet",
    }
  }

  const projectPulse =
    activeProjects.reduce((sum, p) => sum + PROJECT_STATUS_SCORE[p.status], 0) /
    activeProjects.length

  const weeklyRhythm =
    input.weeklyAvgRating !== null
      ? (input.weeklyAvgRating / 5) * 100
      : 60

  const wheelMomentum =
    input.wheelDelta !== null
      ? clamp(50 + input.wheelDelta * 5, 0, 100)
      : 50

  const score = Math.round(
    projectPulse * 0.5 + weeklyRhythm * 0.35 + wheelMomentum * 0.15,
  )

  const atRisk = activeProjects.some((p) => p.status === "AT_RISK")
  const tone: AreaHealthTone = score >= 65 && !atRisk ? "green" : "amber"

  const label =
    tone === "green"
      ? "Steady — projects and rhythm look healthy"
      : atRisk
        ? "Needs attention — a project is at risk"
        : "Mixed — check in on this area"

  return { score, tone, label }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function bucketFor(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}

/** Latest minus previous wheel rating per LifeCategory for the active plan. */
export async function loadWheelDeltaByCategory(
  planId: string,
): Promise<Map<LifeCategory, number>> {
  const entries = await db.wheelOfLifeEntry.findMany({
    where: { planId },
    orderBy: { recordedAt: "asc" },
    select: { category: true, rating: true, recordedAt: true },
  })

  const buckets = new Map<
    string,
    { recordedAt: Date; scores: Partial<Record<LifeCategory, number>> }
  >()

  for (const entry of entries) {
    const key = bucketFor(entry.recordedAt)
    const bucket = buckets.get(key) ?? { recordedAt: entry.recordedAt, scores: {} }
    bucket.scores[entry.category] = entry.rating
    if (entry.recordedAt > bucket.recordedAt) bucket.recordedAt = entry.recordedAt
    buckets.set(key, bucket)
  }

  const snapshots = [...buckets.values()].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime(),
  )

  const latest = snapshots[snapshots.length - 1]
  const previous = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const deltaByCategory = new Map<LifeCategory, number>()

  if (!latest || !previous) return deltaByCategory

  for (const category of lifeCategoryOrder) {
    const current = latest.scores[category]
    const prior = previous.scores[category]
    if (current !== undefined && prior !== undefined) {
      deltaByCategory.set(category, current - prior)
    }
  }

  return deltaByCategory
}

/** Mean weekly progress ratings (1–5) per area from the last four check-ins. */
export async function loadWeeklyAvgRatingByAreaId(
  planId: string,
): Promise<Map<string, number>> {
  const recentWeeks = await db.weeklyCheckIn.findMany({
    where: { planId },
    orderBy: { completedAt: "desc" },
    take: 4,
    select: {
      projectCheckIns: {
        select: {
          progressRating: true,
          project: { select: { areaId: true } },
        },
      },
    },
  })

  const sums = new Map<string, { total: number; count: number }>()

  for (const week of recentWeeks) {
    for (const checkIn of week.projectCheckIns) {
      const areaId = checkIn.project.areaId
      if (!areaId) continue
      const bucket = sums.get(areaId) ?? { total: 0, count: 0 }
      bucket.total += checkIn.progressRating
      bucket.count += 1
      sums.set(areaId, bucket)
    }
  }

  const avgs = new Map<string, number>()
  for (const [areaId, { total, count }] of sums) {
    if (count > 0) avgs.set(areaId, total / count)
  }
  return avgs
}

export async function loadAreaHealthContext(
  planId: string | null,
): Promise<AreaHealthContext> {
  if (!planId) {
    return {
      weeklyAvgByAreaId: new Map(),
      wheelDeltaByCategory: new Map(),
    }
  }

  const [weeklyAvgByAreaId, wheelDeltaByCategory] = await Promise.all([
    loadWeeklyAvgRatingByAreaId(planId),
    loadWheelDeltaByCategory(planId),
  ])

  return { weeklyAvgByAreaId, wheelDeltaByCategory }
}

export function resolveAreaHealth(
  area: {
    id: string
    category: LifeCategory | null
    projects: { status: GoalStatus }[]
  },
  context: AreaHealthContext,
): AreaHealth {
  const wheelDelta =
    area.category !== null
      ? (context.wheelDeltaByCategory.get(area.category) ?? null)
      : null

  return computeAreaHealth({
    projects: area.projects,
    category: area.category,
    weeklyAvgRating: context.weeklyAvgByAreaId.get(area.id) ?? null,
    wheelDelta,
  })
}
