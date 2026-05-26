import type { ParentType } from "@prisma/client"

export type KnowledgeIndexFilter = {
  parentType?: ParentType
  areaId?: string
}

export function knowledgeNotesHref(filters: KnowledgeIndexFilter = {}): string {
  return buildKnowledgeHref("/knowledge/notes", filters)
}

export function knowledgeResourcesHref(filters: KnowledgeIndexFilter = {}): string {
  return buildKnowledgeHref("/knowledge/resources", filters)
}

function buildKnowledgeHref(
  base: "/knowledge/notes" | "/knowledge/resources",
  filters: KnowledgeIndexFilter,
): string {
  const params = new URLSearchParams()
  if (filters.parentType) params.set("parentType", filters.parentType)
  if (filters.areaId) params.set("areaId", filters.areaId)
  const q = params.toString()
  return q ? `${base}?${q}` : base
}

/** Show "View all" when embedded list exceeds preview threshold. */
export const KNOWLEDGE_VIEW_ALL_THRESHOLD = 3
