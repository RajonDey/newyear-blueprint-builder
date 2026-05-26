import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/queries/knowledge-index", () => ({
  listNotesForUser: vi.fn(),
  parseKnowledgeListFilters: vi.fn((params: Record<string, string>) => ({
    parentType: params.parentType,
    areaId: params.areaId,
    cursor: params.cursor,
    limit: params.limit ? Number(params.limit) : undefined,
  })),
}))

import { listNotesForUser } from "@/lib/queries/knowledge-index"
import { GET } from "./route"

const listMock = vi.mocked(listNotesForUser)

function getNotes(url: string) {
  return GET(new Request(url))
}

describe("GET /api/knowledge/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    listMock.mockResolvedValue({ items: [], nextCursor: null })
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await getNotes("http://localhost/api/knowledge/notes")
    expect(res.status).toBe(401)
    expect(listMock).not.toHaveBeenCalled()
  })

  it("lists notes with cursor and filters", async () => {
    const res = await getNotes(
      "http://localhost/api/knowledge/notes?cursor=n-1&parentType=PROJECT&areaId=a-1",
    )
    expect(res.status).toBe(200)
    expect(listMock).toHaveBeenCalledWith("user-test-1", {
      parentType: "PROJECT",
      areaId: "a-1",
      cursor: "n-1",
      limit: undefined,
    })
  })
})
