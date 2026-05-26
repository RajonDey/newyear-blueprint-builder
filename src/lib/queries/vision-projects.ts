import { db } from "@/lib/db"
import type { VisionItemKind } from "@prisma/client"

export type VisionItemPickerRow = {
  id: string
  title: string
  kind: VisionItemKind
}

export type LinkedProjectChip = {
  id: string
  title: string
}

const ACTIVE_PROJECT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_TRACK", "AT_RISK"] as const

/** Vision board cards for the project "Serves vision" picker. */
export async function getVisionItemsForPicker(
  userId: string,
): Promise<VisionItemPickerRow[]> {
  const vision = await db.vision.findUnique({
    where: { userId },
    select: {
      items: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, kind: true },
      },
    },
  })
  return vision?.items ?? []
}

/** Active-plan projects grouped by linked vision item id. */
export async function getLinkedProjectsByVisionItemIds(
  userId: string,
  visionItemIds: string[],
): Promise<Map<string, LinkedProjectChip[]>> {
  const map = new Map<string, LinkedProjectChip[]>()
  if (visionItemIds.length === 0) return map

  const projects = await db.project.findMany({
    where: {
      visionItemId: { in: visionItemIds },
      plan: { userId, status: "ACTIVE" },
      status: { in: [...ACTIVE_PROJECT_STATUSES] },
    },
    select: { id: true, title: true, visionItemId: true },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
  })

  for (const project of projects) {
    if (!project.visionItemId) continue
    const list = map.get(project.visionItemId) ?? []
    list.push({ id: project.id, title: project.title })
    map.set(project.visionItemId, list)
  }

  return map
}

/**
 * Dashboard foundation strip — count distinct vision milestones that have
 * at least one active project linked on the current yearly plan.
 */
export async function getVisionMilestoneProjectSummary(userId: string): Promise<{
  linkedMilestoneCount: number
}> {
  const rows = await db.project.findMany({
    where: {
      visionItemId: { not: null },
      plan: { userId, status: "ACTIVE" },
      status: { in: [...ACTIVE_PROJECT_STATUSES] },
    },
    select: {
      visionItem: { select: { id: true, kind: true } },
    },
  })

  const milestoneIds = new Set(
    rows
      .map((r) => (r.visionItem?.kind === "MILESTONE" ? r.visionItem.id : null))
      .filter((id): id is string => Boolean(id)),
  )

  return { linkedMilestoneCount: milestoneIds.size }
}

/** Verify a vision item belongs to the user before linking a project. */
export async function visionItemBelongsToUser(
  userId: string,
  visionItemId: string,
): Promise<boolean> {
  return Boolean(
    await db.visionItem.findFirst({
      where: { id: visionItemId, vision: { userId } },
      select: { id: true },
    }),
  )
}
