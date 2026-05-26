import { beforeEach, describe, expect, it, vi } from "vitest"
import { ParentType } from "@prisma/client"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    note: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("@/lib/parent-guard", () => ({
  assertParentBelongsToUser: vi.fn(),
}))

import { db } from "@/lib/db"
import { assertParentBelongsToUser } from "@/lib/parent-guard"
import { POST } from "./route"

const noteDb = vi.mocked(db.note)
const parentGuard = vi.mocked(assertParentBelongsToUser)

function postNotes(body: unknown) {
  return POST(
    new Request("http://localhost/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  )
}

describe("POST /api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    parentGuard.mockResolvedValue(true)
    noteDb.count.mockResolvedValue(0)
    noteDb.create.mockResolvedValue({
      id: "note-1",
      userId: "user-test-1",
      parentType: ParentType.PROJECT,
      parentId: "project-1",
      content: "Hello",
      pinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await postNotes({
      parentType: "PROJECT",
      parentId: "project-1",
      content: "Test",
    })
    expect(res.status).toBe(401)
    expect(noteDb.create).not.toHaveBeenCalled()
  })

  it("returns 404 when parent does not belong to user", async () => {
    parentGuard.mockResolvedValue(false)
    const res = await postNotes({
      parentType: "PROJECT",
      parentId: "other-users-project",
      content: "Test",
    })
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe("Parent not found")
  })

  it("returns 402 when note quota is reached", async () => {
    noteDb.count.mockResolvedValue(999)
    const res = await postNotes({
      parentType: "PROJECT",
      parentId: "project-1",
      content: "Test",
    })
    expect(res.status).toBe(402)
    const json = await res.json()
    expect(json.error).toBe("NOTE_LIMIT")
    expect(json.upgradeUrl).toBe("/pricing")
  })

  it("returns 201 when note is created", async () => {
    const res = await postNotes({
      parentType: "PROJECT",
      parentId: "project-1",
      content: "Reflection",
    })
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.data.id).toBe("note-1")
    expect(noteDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          parentType: ParentType.PROJECT,
          parentId: "project-1",
          content: "Reflection",
        }),
      }),
    )
  })
})
