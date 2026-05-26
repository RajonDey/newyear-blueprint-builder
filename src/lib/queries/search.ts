import type { ParentType } from "@prisma/client"
import { db } from "@/lib/db"

export type SearchResultType = "project" | "task" | "note" | "drift" | "area"

export type SearchResultItem = {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  snippet?: string
  href: string
}

export type SearchResultGroup = {
  type: SearchResultType
  label: string
  items: SearchResultItem[]
}

export type SearchResponse = {
  query: string
  groups: SearchResultGroup[]
}

const GROUP_LABELS: Record<SearchResultType, string> = {
  project: "Projects",
  task: "Tasks",
  note: "Notes",
  drift: "Drift inbox",
  area: "Areas",
}

/** Truncate note/task text for palette display. */
export function buildSearchSnippet(text: string, max = 120): string {
  const normalized = text.replace(/\s+/g, " ").trim()
  if (normalized.length <= max) return normalized
  return `${normalized.slice(0, max - 1)}…`
}

function parentHref(
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

async function resolveNoteParentLabels(
  userId: string,
  notes: { parentType: ParentType; parentId: string }[],
): Promise<Map<string, string>> {
  const labels = new Map<string, string>()
  if (notes.length === 0) return labels

  const byType = new Map<ParentType, Set<string>>()
  for (const n of notes) {
    const set = byType.get(n.parentType) ?? new Set<string>()
    set.add(n.parentId)
    byType.set(n.parentType, set)
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
          select: { id: true, title: true },
        })
      : [],
    taskIds.length
      ? db.task.findMany({
          where: { id: { in: taskIds }, project: { plan: { userId } } },
          select: { id: true, description: true, project: { select: { title: true } } },
        })
      : [],
    systemIds.length
      ? db.system.findMany({
          where: { id: { in: systemIds }, project: { plan: { userId } } },
          select: { id: true, description: true, project: { select: { title: true } } },
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
          select: { id: true, title: true },
        })
      : [],
  ])

  for (const a of areas) labels.set(`AREA:${a.id}`, a.name)
  for (const p of projects) labels.set(`PROJECT:${p.id}`, p.title)
  for (const t of tasks) {
    labels.set(`TASK:${t.id}`, `${t.project.title} · task`)
  }
  for (const s of systems) {
    labels.set(`SYSTEM:${s.id}`, `${s.project.title} · system`)
  }
  for (const v of visions) labels.set(`VISION:${v.id}`, "Life vision")
  for (const vi of visionItems) labels.set(`VISION_ITEM:${vi.id}`, vi.title)

  return labels
}

function perTypeLimit(total: number, slots: number): number {
  return Math.max(1, Math.floor(total / slots))
}

/**
 * Tenant-scoped global search across PARA surfaces.
 * Empty query returns recent projects for palette defaults.
 */
export async function searchUserContent(
  userId: string,
  query: string,
  limit = 20,
): Promise<SearchResponse> {
  const q = query.trim()
  const cappedLimit = Math.min(Math.max(limit, 1), 20)

  if (!q) {
    const projects = await db.project.findMany({
      where: { plan: { userId, status: "ACTIVE" } },
      select: {
        id: true,
        title: true,
        area: { select: { name: true } },
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      take: Math.min(cappedLimit, 8),
    })

    return {
      query: "",
      groups: projects.length
        ? [
            {
              type: "project",
              label: GROUP_LABELS.project,
              items: projects.map((p) => ({
                id: p.id,
                type: "project" as const,
                title: p.title,
                subtitle: p.area?.name ?? undefined,
                href: `/projects/${p.id}`,
              })),
            },
          ]
        : [],
    }
  }

  const perType = perTypeLimit(cappedLimit, 5)

  const [projects, tasks, notes, drifts, areas] = await Promise.all([
    db.project.findMany({
      where: {
        plan: { userId, status: "ACTIVE" },
        title: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        area: { select: { name: true } },
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      take: perType,
    }),
    db.task.findMany({
      where: {
        project: { plan: { userId, status: "ACTIVE" } },
        description: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        description: true,
        project: { select: { id: true, title: true } },
      },
      orderBy: { description: "asc" },
      take: perType,
    }),
    db.note.findMany({
      where: {
        userId,
        content: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        content: true,
        parentType: true,
        parentId: true,
      },
      orderBy: { updatedAt: "desc" },
      take: perType,
    }),
    db.drift.findMany({
      where: {
        userId,
        resolvedAt: null,
        content: { contains: q, mode: "insensitive" },
      },
      select: { id: true, content: true },
      orderBy: { createdAt: "desc" },
      take: perType,
    }),
    db.area.findMany({
      where: {
        userId,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
      take: perType,
    }),
  ])

  const noteTaskIds = notes
    .filter((n) => n.parentType === "TASK")
    .map((n) => n.parentId)
  const noteSystemIds = notes
    .filter((n) => n.parentType === "SYSTEM")
    .map((n) => n.parentId)

  const [noteTasks, noteSystems, parentLabels] = await Promise.all([
    noteTaskIds.length
      ? db.task.findMany({
          where: { id: { in: noteTaskIds }, project: { plan: { userId } } },
          select: { id: true, projectId: true },
        })
      : [],
    noteSystemIds.length
      ? db.system.findMany({
          where: { id: { in: noteSystemIds }, project: { plan: { userId } } },
          select: { id: true, projectId: true },
        })
      : [],
    resolveNoteParentLabels(userId, notes),
  ])

  const taskProjectById = new Map(noteTasks.map((t) => [t.id, t.projectId]))
  const systemProjectById = new Map(noteSystems.map((s) => [s.id, s.projectId]))

  const groups: SearchResultGroup[] = []

  if (projects.length > 0) {
    groups.push({
      type: "project",
      label: GROUP_LABELS.project,
      items: projects.map((p) => ({
        id: p.id,
        type: "project",
        title: p.title,
        subtitle: p.area?.name ?? undefined,
        href: `/projects/${p.id}`,
      })),
    })
  }

  if (tasks.length > 0) {
    groups.push({
      type: "task",
      label: GROUP_LABELS.task,
      items: tasks.map((t) => ({
        id: t.id,
        type: "task",
        title: t.description,
        subtitle: t.project.title,
        href: `/projects/${t.project.id}`,
      })),
    })
  }

  if (notes.length > 0) {
    groups.push({
      type: "note",
      label: GROUP_LABELS.note,
      items: notes.map((n) => {
        const projectId =
          n.parentType === "TASK"
            ? taskProjectById.get(n.parentId)
            : n.parentType === "SYSTEM"
              ? systemProjectById.get(n.parentId)
              : null
        return {
          id: n.id,
          type: "note" as const,
          title: buildSearchSnippet(n.content, 80),
          subtitle:
            parentLabels.get(`${n.parentType}:${n.parentId}`) ??
            "Attached note",
          snippet: buildSearchSnippet(n.content),
          href: parentHref(n.parentType, n.parentId, projectId),
        }
      }),
    })
  }

  if (drifts.length > 0) {
    groups.push({
      type: "drift",
      label: GROUP_LABELS.drift,
      items: drifts.map((d) => ({
        id: d.id,
        type: "drift",
        title: buildSearchSnippet(d.content, 80),
        snippet: buildSearchSnippet(d.content),
        href: `/drifts?focus=${d.id}`,
      })),
    })
  }

  if (areas.length > 0) {
    groups.push({
      type: "area",
      label: GROUP_LABELS.area,
      items: areas.map((a) => ({
        id: a.id,
        type: "area",
        title: a.name,
        subtitle: a.category ?? undefined,
        href: `/areas/${a.id}`,
      })),
    })
  }

  return { query: q, groups }
}
