import type { LifeCategory, Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import {
  areaHexByCategory,
  lifeCategoryLabels,
  lifeCategoryOrder,
} from "@/lib/level-styles"

type DbClient = typeof db | Prisma.TransactionClient

const DEFAULT_AREA_DESCRIPTIONS: Record<LifeCategory, string> = {
  HEALTH: "Body, mind, recovery, sleep.",
  CAREER: "Work, craft, learning, professional growth.",
  FINANCE: "Income, savings, investments, financial literacy.",
  RELATIONSHIPS: "Family, friendships, partners, community.",
  SPIRITUALITY: "Purpose, contemplation, gratitude, inner life.",
  PASSION: "Creative pursuits, hobbies, things that light you up.",
}

const DEFAULT_AREA_ICONS: Record<LifeCategory, string> = {
  HEALTH: "Heart",
  CAREER: "Briefcase",
  FINANCE: "Wallet",
  RELATIONSHIPS: "Users",
  SPIRITUALITY: "Sparkles",
  PASSION: "Star",
}

/** Ensure the six wheel-aligned default areas exist (e.g. new users after onboarding). */
export async function ensureDefaultAreasForUser(
  userId: string,
  client: DbClient = db,
) {
  for (let i = 0; i < lifeCategoryOrder.length; i++) {
    const category = lifeCategoryOrder[i]
    const existing = await client.area.findFirst({
      where: { userId, category, isDefault: true },
      select: { id: true },
    })
    if (existing) continue

    await client.area.create({
      data: {
        userId,
        name: lifeCategoryLabels[category],
        color: areaHexByCategory[category],
        icon: DEFAULT_AREA_ICONS[category],
        description: DEFAULT_AREA_DESCRIPTIONS[category],
        category,
        isDefault: true,
        sortOrder: i,
      },
    })
  }
}

/** Default area row for a life category — used when creating projects without an explicit area. */
export async function findDefaultAreaIdForCategory(
  userId: string,
  category: LifeCategory,
  client: DbClient = db,
): Promise<string | null> {
  const preferred = await client.area.findFirst({
    where: { userId, category, isDefault: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  })
  if (preferred) return preferred.id

  const fallback = await client.area.findFirst({
    where: { userId, category },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  })
  return fallback?.id ?? null
}

/**
 * Link orphan projects (category set, areaId null) to their default area.
 * Idempotent — safe to run on area reads.
 */
export async function backfillOrphanProjectsForPlan(
  planId: string,
  userId: string,
  client: DbClient = db,
) {
  const areas = await client.area.findMany({
    where: { userId, category: { not: null } },
    select: { id: true, category: true },
  })

  await Promise.all(
    areas.map((area) => {
      if (!area.category) return Promise.resolve()
      return client.project.updateMany({
        where: { planId, areaId: null, category: area.category },
        data: { areaId: area.id },
      })
    }),
  )
}
