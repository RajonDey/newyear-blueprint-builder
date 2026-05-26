import { db } from "@/lib/db"
import type { VisionItem } from "@prisma/client"

/**
 * Vision queries — the life-spanning Vision board.
 *
 * One `Vision` row per user (1:1). The `northStar` field is the prose
 * statement at the top of `/vision`; `items` is the board of `VisionItem`
 * cards (statement / value / milestone / image / quote).
 *
 * The Vision row is seeded by the Phase 2 migration so this fetcher will
 * never need to create one — but we still upsert defensively if it's
 * somehow missing (e.g. user created mid-migration window).
 */

export type VisionWithItems = {
  id: string
  northStar: string | null
  items: VisionItem[]
}

export async function getVisionForUser(userId: string): Promise<VisionWithItems> {
  const existing = await db.vision.findUnique({
    where: { userId },
    include: { items: { orderBy: { order: "asc" } } },
  })
  if (existing) {
    return {
      id: existing.id,
      northStar: existing.northStar,
      items: existing.items,
    }
  }

  const created = await db.vision.create({
    data: { userId },
    include: { items: true },
  })
  return {
    id: created.id,
    northStar: created.northStar,
    items: created.items,
  }
}
