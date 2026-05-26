import type { ParentType, Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import {
  getProjectIdsForTaskAndSystemParents,
  parentHrefWithNoteAnchor,
  parentKey,
  resolveParentContexts,
  type ParentContext,
} from "@/lib/knowledge/parent-context"
import type { NoteRow } from "@/lib/queries/notes"
import type { ResourceRow } from "@/lib/queries/resources"

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

export type KnowledgeListFilters = {
  parentType?: ParentType | "ALL"
  areaId?: string
  cursor?: string
  limit?: number
}

const VALID_PARENT_TYPES = new Set<ParentType>([
  "AREA",
  "PROJECT",
  "VISION",
  "VISION_ITEM",
  "TASK",
  "SYSTEM",
])

/** Parse URL search params into list filters (used by pages + API routes). */
export function parseKnowledgeListFilters(
  params: Record<string, string | undefined>,
): KnowledgeListFilters {
  const parentTypeRaw = params.parentType?.trim()
  const parentType =
    parentTypeRaw && VALID_PARENT_TYPES.has(parentTypeRaw as ParentType)
      ? (parentTypeRaw as ParentType)
      : undefined

  const areaId = params.areaId?.trim() || undefined
  const cursor = params.cursor?.trim() || undefined

  const rawLimit = params.limit ? Number.parseInt(params.limit, 10) : undefined
  const limit =
    rawLimit !== undefined && Number.isFinite(rawLimit) ? rawLimit : undefined

  return { parentType, areaId, cursor, limit }
}

export type PaginatedList<T> = {
  items: T[]
  nextCursor: string | null
}

export type NoteIndexRow = NoteRow & {
  parent: ParentContext
  parentHref: string
}

export type ResourceIndexRow = ResourceRow & {
  parent: ParentContext
  parentHref: string
}

async function getAreaScope(userId: string, areaId: string) {
  const [projects, visionItems] = await Promise.all([
    db.project.findMany({
      where: { areaId, plan: { userId } },
      select: { id: true },
    }),
    db.visionItem.findMany({
      where: { areaId, vision: { userId } },
      select: { id: true },
    }),
  ])

  const projectIds = projects.map((p) => p.id)
  const [tasks, systems] = await Promise.all([
    projectIds.length
      ? db.task.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
        })
      : [],
    projectIds.length
      ? db.system.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
        })
      : [],
  ])

  return {
    projectIds,
    taskIds: tasks.map((t) => t.id),
    systemIds: systems.map((s) => s.id),
    visionItemIds: visionItems.map((v) => v.id),
  }
}

async function buildPolymorphicWhere(
  userId: string,
  filters: KnowledgeListFilters,
): Promise<Prisma.NoteWhereInput> {
  const where: Prisma.NoteWhereInput = { userId }

  if (filters.parentType && filters.parentType !== "ALL") {
    where.parentType = filters.parentType
  }

  if (filters.areaId) {
    const scope = await getAreaScope(userId, filters.areaId)
    const or: Prisma.NoteWhereInput[] = [
      { parentType: "AREA", parentId: filters.areaId },
    ]
    if (scope.projectIds.length > 0) {
      or.push({ parentType: "PROJECT", parentId: { in: scope.projectIds } })
    }
    if (scope.taskIds.length > 0) {
      or.push({ parentType: "TASK", parentId: { in: scope.taskIds } })
    }
    if (scope.systemIds.length > 0) {
      or.push({ parentType: "SYSTEM", parentId: { in: scope.systemIds } })
    }
    if (scope.visionItemIds.length > 0) {
      or.push({ parentType: "VISION_ITEM", parentId: { in: scope.visionItemIds } })
    }
    where.OR = or
  }

  return where
}

async function buildResourceWhere(
  userId: string,
  filters: KnowledgeListFilters,
): Promise<Prisma.ResourceWhereInput> {
  const where: Prisma.ResourceWhereInput = { userId }

  if (filters.parentType && filters.parentType !== "ALL") {
    where.parentType = filters.parentType
  }

  if (filters.areaId) {
    const scope = await getAreaScope(userId, filters.areaId)
    const or: Prisma.ResourceWhereInput[] = [
      { parentType: "AREA", parentId: filters.areaId },
    ]
    if (scope.projectIds.length > 0) {
      or.push({ parentType: "PROJECT", parentId: { in: scope.projectIds } })
    }
    if (scope.taskIds.length > 0) {
      or.push({ parentType: "TASK", parentId: { in: scope.taskIds } })
    }
    if (scope.systemIds.length > 0) {
      or.push({ parentType: "SYSTEM", parentId: { in: scope.systemIds } })
    }
    if (scope.visionItemIds.length > 0) {
      or.push({ parentType: "VISION_ITEM", parentId: { in: scope.visionItemIds } })
    }
    where.OR = or
  }

  return where
}

function clampLimit(limit?: number): number {
  if (!limit || !Number.isFinite(limit)) return DEFAULT_LIMIT
  return Math.min(Math.max(Math.floor(limit), 1), MAX_LIMIT)
}

async function enrichNotes(
  userId: string,
  notes: NoteRow[],
): Promise<NoteIndexRow[]> {
  const contexts = await resolveParentContexts(userId, notes)
  const taskIds = notes.filter((n) => n.parentType === "TASK").map((n) => n.parentId)
  const systemIds = notes.filter((n) => n.parentType === "SYSTEM").map((n) => n.parentId)
  const projectByParentId = await getProjectIdsForTaskAndSystemParents(
    userId,
    taskIds,
    systemIds,
  )

  return notes.map((note) => {
    const parent =
      contexts.get(parentKey(note.parentType, note.parentId)) ?? {
        label: "Unknown",
        href: "/dashboard",
        areaId: null,
        areaName: null,
      }
    const projectId = projectByParentId.get(note.parentId) ?? null
    return {
      ...note,
      parent,
      parentHref: parentHrefWithNoteAnchor(
        note.parentType,
        note.parentId,
        note.id,
        projectId,
      ),
    }
  })
}

async function enrichResources(
  userId: string,
  resources: ResourceRow[],
): Promise<ResourceIndexRow[]> {
  const contexts = await resolveParentContexts(userId, resources)

  return resources.map((resource) => {
    const parent =
      contexts.get(parentKey(resource.parentType, resource.parentId)) ?? {
        label: "Unknown",
        href: "/dashboard",
        areaId: null,
        areaName: null,
      }
    return {
      ...resource,
      parent,
      parentHref: parent.href,
    }
  })
}

export async function listNotesForUser(
  userId: string,
  filters: KnowledgeListFilters = {},
): Promise<PaginatedList<NoteIndexRow>> {
  const limit = clampLimit(filters.limit)
  const where = await buildPolymorphicWhere(userId, filters)

  const rows = await db.note.findMany({
    where,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(filters.cursor
      ? { cursor: { id: filters.cursor }, skip: 1 }
      : {}),
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const items = await enrichNotes(userId, page)

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  }
}

export async function listResourcesForUser(
  userId: string,
  filters: KnowledgeListFilters = {},
): Promise<PaginatedList<ResourceIndexRow>> {
  const limit = clampLimit(filters.limit)
  const where = await buildResourceWhere(userId, filters)

  const rows = await db.resource.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(filters.cursor
      ? { cursor: { id: filters.cursor }, skip: 1 }
      : {}),
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const items = await enrichResources(userId, page)

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  }
}

export async function countNotesForUserFiltered(
  userId: string,
  filters: Omit<KnowledgeListFilters, "cursor" | "limit"> = {},
): Promise<number> {
  const where = await buildPolymorphicWhere(userId, filters)
  return db.note.count({ where })
}

export async function countResourcesForUserFiltered(
  userId: string,
  filters: Omit<KnowledgeListFilters, "cursor" | "limit"> = {},
): Promise<number> {
  const where = await buildResourceWhere(userId, filters)
  return db.resource.count({ where })
}
