import type { ParentType } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * Verifies that the `(parentType, parentId)` pair belongs to the given user.
 *
 * Notes, Resources, and any future polymorphic child must call this before
 * trusting a client-supplied parent — the parent's ownership is what ties
 * the polymorphic row back to the user.
 *
 * Returns `true` if the parent exists and belongs to the user, `false`
 * otherwise. Callers should return HTTP 404 on `false` (avoid leaking the
 * existence of other users' rows).
 */
export async function assertParentBelongsToUser(
  userId: string,
  parentType: ParentType,
  parentId: string,
): Promise<boolean> {
  switch (parentType) {
    case "AREA":
      return Boolean(
        await db.area.findFirst({
          where: { id: parentId, userId },
          select: { id: true },
        }),
      )
    case "PROJECT":
      return Boolean(
        await db.project.findFirst({
          where: { id: parentId, plan: { userId } },
          select: { id: true },
        }),
      )
    case "TASK":
      return Boolean(
        await db.task.findFirst({
          where: { id: parentId, project: { plan: { userId } } },
          select: { id: true },
        }),
      )
    case "SYSTEM":
      return Boolean(
        await db.system.findFirst({
          where: { id: parentId, project: { plan: { userId } } },
          select: { id: true },
        }),
      )
    case "VISION":
      return Boolean(
        await db.vision.findFirst({
          where: { id: parentId, userId },
          select: { id: true },
        }),
      )
    case "VISION_ITEM":
      return Boolean(
        await db.visionItem.findFirst({
          where: { id: parentId, vision: { userId } },
          select: { id: true },
        }),
      )
    default:
      return false
  }
}
