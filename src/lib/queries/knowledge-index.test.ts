import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    note: { findMany: vi.fn() },
    resource: { findMany: vi.fn() },
    project: { findMany: vi.fn() },
    task: { findMany: vi.fn() },
    system: { findMany: vi.fn() },
    visionItem: { findMany: vi.fn() },
    area: { findMany: vi.fn() },
    vision: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/knowledge/parent-context", () => ({
  resolveParentContexts: vi.fn(async () => new Map()),
  getProjectIdsForTaskAndSystemParents: vi.fn(async () => new Map()),
  parentHrefWithNoteAnchor: vi.fn(
    (_type: string, _id: string, noteId: string) =>
      `/projects/p-1#note-${noteId}`,
  ),
  parentKey: vi.fn((type: string, id: string) => `${type}:${id}`),
}))

import { db } from "@/lib/db"
import {
  listNotesForUser,
  parseKnowledgeListFilters,
} from "@/lib/queries/knowledge-index"

describe("parseKnowledgeListFilters", () => {
  it("parses valid parent type and area", () => {
    expect(
      parseKnowledgeListFilters({
        parentType: "PROJECT",
        areaId: "area-1",
        cursor: "note-1",
        limit: "30",
      }),
    ).toEqual({
      parentType: "PROJECT",
      areaId: "area-1",
      cursor: "note-1",
      limit: 30,
    })
  })

  it("drops invalid parent type", () => {
    expect(parseKnowledgeListFilters({ parentType: "INVALID" })).toEqual({
      parentType: undefined,
      areaId: undefined,
      cursor: undefined,
      limit: undefined,
    })
  })
})

describe("listNotesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("caps page size at 50 and returns next cursor", async () => {
    const rows = Array.from({ length: 51 }, (_, i) => ({
      id: `note-${i}`,
      parentType: "PROJECT" as const,
      parentId: "p-1",
      content: `Note ${i}`,
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
    vi.mocked(db.note.findMany).mockResolvedValue(rows as never)

    const result = await listNotesForUser("user-1", { limit: 999 })

    expect(db.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 51 }),
    )
    expect(result.items).toHaveLength(50)
    expect(result.nextCursor).toBe("note-49")
  })
})
