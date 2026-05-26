import type { ParentType } from "@prisma/client"
import { db } from "@/lib/db"

export type ParentContext = {
  label: string
  href: string
  areaId: string | null
  areaName: string | null
}

export function parentKey(parentType: ParentType, parentId: string): string {
  return `${parentType}:${parentId}`
}

export function parentHref(
  parentType: ParentType,
  parentId: string,
  projectId?: string | null,
): string {
  switch (parentType) {
    case "AREA":
      return `/areas/${parentId}`
    case "PROJECT":
      return `/projects/${parentId}`
    case "TASK":
      return projectId ? `/projects/${projectId}` : "/tasks"
    case "SYSTEM":
      return projectId ? `/projects/${projectId}` : "/systems"
    case "VISION":
    case "VISION_ITEM":
      return "/vision"
    default:
      return "/dashboard"
  }
}

export function noteAnchor(noteId: string): string {
  return `#note-${noteId}`
}

export function parentHrefWithNoteAnchor(
  parentType: ParentType,
  parentId: string,
  noteId: string,
  projectId?: string | null,
): string {
  return `${parentHref(parentType, parentId, projectId)}${noteAnchor(noteId)}`
}

type ParentRef = { parentType: ParentType; parentId: string }

/** Batch-resolve parent labels and navigation targets for knowledge index rows. */
export async function resolveParentContexts(
  userId: string,
  refs: ParentRef[],
): Promise<Map<string, ParentContext>> {
  const labels = new Map<string, ParentContext>()
  if (refs.length === 0) return labels

  const byType = new Map<ParentType, Set<string>>()
  for (const ref of refs) {
    const set = byType.get(ref.parentType) ?? new Set<string>()
    set.add(ref.parentId)
    byType.set(ref.parentType, set)
  }

  const areaIds = [...(byType.get("AREA") ?? [])]
  const projectIds = [...(byType.get("PROJECT") ?? [])]
  const taskIds = [...(byType.get("TASK") ?? [])]
  const systemIds = [...(byType.get("SYSTEM") ?? [])]
  const visionIds = [...(byType.get("VISION") ?? [])]
  const visionItemIds = [...(byType.get("VISION_ITEM") ?? [])]

  const [areas, projects, tasks, systems, visions, visionItems] = await Promise.all([
    areaIds.length
      ? db.area.findMany({
          where: { userId, id: { in: areaIds } },
          select: { id: true, name: true },
        })
      : [],
    projectIds.length
      ? db.project.findMany({
          where: { id: { in: projectIds }, plan: { userId } },
          select: { id: true, title: true, areaId: true, area: { select: { name: true } } },
        })
      : [],
    taskIds.length
      ? db.task.findMany({
          where: { id: { in: taskIds }, project: { plan: { userId } } },
          select: {
            id: true,
            description: true,
            projectId: true,
            project: {
              select: {
                title: true,
                areaId: true,
                area: { select: { name: true } },
              },
            },
          },
        })
      : [],
    systemIds.length
      ? db.system.findMany({
          where: { id: { in: systemIds }, project: { plan: { userId } } },
          select: {
            id: true,
            description: true,
            projectId: true,
            project: {
              select: {
                title: true,
                areaId: true,
                area: { select: { name: true } },
              },
            },
          },
        })
      : [],
    visionIds.length
      ? db.vision.findMany({
          where: { userId, id: { in: visionIds } },
          select: { id: true },
        })
      : [],
    visionItemIds.length
      ? db.visionItem.findMany({
          where: { id: { in: visionItemIds }, vision: { userId } },
          select: { id: true, title: true, areaId: true, area: { select: { name: true } } },
        })
      : [],
  ])

  for (const a of areas) {
    labels.set(parentKey("AREA", a.id), {
      label: a.name,
      href: parentHref("AREA", a.id),
      areaId: a.id,
      areaName: a.name,
    })
  }
  for (const p of projects) {
    labels.set(parentKey("PROJECT", p.id), {
      label: p.title,
      href: parentHref("PROJECT", p.id),
      areaId: p.areaId,
      areaName: p.area?.name ?? null,
    })
  }
  for (const t of tasks) {
    labels.set(parentKey("TASK", t.id), {
      label: `${t.project.title} · task`,
      href: parentHref("TASK", t.id, t.projectId),
      areaId: t.project.areaId,
      areaName: t.project.area?.name ?? null,
    })
  }
  for (const s of systems) {
    labels.set(parentKey("SYSTEM", s.id), {
      label: `${s.project.title} · system`,
      href: parentHref("SYSTEM", s.id, s.projectId),
      areaId: s.project.areaId,
      areaName: s.project.area?.name ?? null,
    })
  }
  for (const v of visions) {
    labels.set(parentKey("VISION", v.id), {
      label: "Life vision",
      href: parentHref("VISION", v.id),
      areaId: null,
      areaName: null,
    })
  }
  for (const vi of visionItems) {
    labels.set(parentKey("VISION_ITEM", vi.id), {
      label: vi.title,
      href: parentHref("VISION_ITEM", vi.id),
      areaId: vi.areaId,
      areaName: vi.area?.name ?? null,
    })
  }

  return labels
}

export async function getProjectIdsForTaskAndSystemParents(
  userId: string,
  taskIds: string[],
  systemIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (taskIds.length === 0 && systemIds.length === 0) return map

  const [tasks, systems] = await Promise.all([
    taskIds.length
      ? db.task.findMany({
          where: { id: { in: taskIds }, project: { plan: { userId } } },
          select: { id: true, projectId: true },
        })
      : [],
    systemIds.length
      ? db.system.findMany({
          where: { id: { in: systemIds }, project: { plan: { userId } } },
          select: { id: true, projectId: true },
        })
      : [],
  ])

  for (const t of tasks) map.set(t.id, t.projectId)
  for (const s of systems) map.set(s.id, s.projectId)
  return map
}
