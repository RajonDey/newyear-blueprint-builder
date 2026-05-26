import type { ParentType, ResourceKind } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * Resources queries — the "R" in PARA's Notes/Resources pair.
 *
 * Like Notes, Resources are polymorphic via `(parentType, parentId)`. Every
 * row belongs to one User; ownership is enforced on every fetch by joining
 * through `Resource.userId`.
 */

export type ResourceRow = {
  id: string
  parentType: ParentType
  parentId: string
  kind: ResourceKind
  title: string
  url: string
  mimeType: string | null
  sizeBytes: number | null
  createdAt: Date
}

export async function getResourcesForParent(
  userId: string,
  parentType: ParentType,
  parentId: string,
): Promise<ResourceRow[]> {
  return db.resource.findMany({
    where: { userId, parentType, parentId },
    orderBy: { createdAt: "desc" },
  })
}

export async function countResourcesForUser(userId: string): Promise<number> {
  return db.resource.count({ where: { userId } })
}

/** Total bytes used by FILE-kind resources — powers Pro storage quota math. */
export async function totalResourceStorageBytes(
  userId: string,
): Promise<number> {
  const agg = await db.resource.aggregate({
    where: { userId, kind: "FILE" },
    _sum: { sizeBytes: true },
  })
  return agg._sum.sizeBytes ?? 0
}
