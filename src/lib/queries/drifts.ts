import type { Drift, DriftKind } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * Drift (Quick Capture) queries.
 *
 * A "drift" is a thought that needs to leave the user's head **right now**;
 * the inbox lives until they choose to promote it into a Note, Task, or
 * Resource — or dismiss it. We split on `resolvedAt` because the inbox card
 * only ever shows unresolved rows, but `/drifts` + analytics need the full
 * timeline.
 */

export type DriftInbox = {
  total: number
  rows: Drift[]
}

/** Inbox (unresolved) drifts for the dashboard pill + Process dialog. */
export async function getDriftInboxForUser(
  userId: string,
  limit = 20,
): Promise<DriftInbox> {
  const [total, rows] = await Promise.all([
    db.drift.count({ where: { userId, resolvedAt: null } }),
    db.drift.findMany({
      where: { userId, resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ])
  return { total, rows }
}

/** Unresolved inbox count — sidebar badge + layout shell. */
export async function getUnresolvedDriftCount(userId: string): Promise<number> {
  return db.drift.count({ where: { userId, resolvedAt: null } })
}

export type DriftHistoryGroup = {
  kind: DriftKind
  resolvedAs: string | null
  total: number
}

/** Aggregate resolved counts — useful for the "captured / processed" badge. */
export async function getDriftResolvedSummary(userId: string) {
  const total = await db.drift.count({
    where: { userId, resolvedAt: { not: null } },
  })
  return { total }
}

export type DriftListBucket = "inbox" | "resolved" | "all"

export type DriftListResult = {
  inbox: Drift[]
  resolved: Drift[]
  counts: {
    inbox: number
    resolved: number
    total: number
  }
}

/**
 * Listing for the `/drifts` page. Returns both buckets in a single round trip
 * so the page can render its tabs without an additional fetch when the user
 * flips between Inbox and Resolved. Search is server-side, case-insensitive,
 * and capped at 100 rows per bucket — the UI relies on the user to refine
 * their query rather than paginating.
 */
export async function getDriftsForUser(
  userId: string,
  options: { search?: string; limit?: number } = {},
): Promise<DriftListResult> {
  const limit = options.limit ?? 100
  const search = options.search?.trim()

  const where = {
    userId,
    ...(search
      ? {
          content: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {}),
  }

  const [inboxCount, resolvedCount, totalCount, inboxRows, resolvedRows] =
    await Promise.all([
      db.drift.count({ where: { ...where, resolvedAt: null } }),
      db.drift.count({ where: { ...where, resolvedAt: { not: null } } }),
      db.drift.count({ where: { userId } }),
      db.drift.findMany({
        where: { ...where, resolvedAt: null },
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      db.drift.findMany({
        where: { ...where, resolvedAt: { not: null } },
        orderBy: { resolvedAt: "desc" },
        take: limit,
      }),
    ])

  return {
    inbox: inboxRows,
    resolved: resolvedRows,
    counts: {
      inbox: inboxCount,
      resolved: resolvedCount,
      total: totalCount,
    },
  }
}
