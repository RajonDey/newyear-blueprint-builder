import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    project: { findFirst: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    visionItem: { findFirst: vi.fn() },
    motivation: { findUnique: vi.fn(), upsert: vi.fn() },
    achievement: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/queries/vision-projects", () => ({
  visionItemBelongsToUser: vi.fn(),
}))

import { db } from "@/lib/db"
import { visionItemBelongsToUser } from "@/lib/queries/vision-projects"
import { PUT } from "./route"

const belongsMock = vi.mocked(visionItemBelongsToUser)
const projectFindFirst = vi.mocked(db.project.findFirst)

function putProject(projectId: string, body: unknown) {
  return PUT(
    new Request(`http://localhost/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ projectId }) },
  )
}

describe("PUT /api/projects/[projectId] visionItemId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    projectFindFirst.mockResolvedValue({
      id: "p-1",
      status: "IN_PROGRESS",
    } as never)
    belongsMock.mockResolvedValue(true)
    vi.mocked(db.$transaction).mockImplementation(async (fn) =>
      fn({
        project: {
          update: vi.fn().mockResolvedValue({ id: "p-1", visionItemId: "vi-1" }),
        },
        motivation: { findUnique: vi.fn(), upsert: vi.fn() },
        achievement: { upsert: vi.fn() },
      } as never),
    )
  })

  it("returns 404 when vision item does not belong to user", async () => {
    belongsMock.mockResolvedValue(false)
    const res = await putProject("p-1", { visionItemId: "vi-other" })
    expect(res.status).toBe(404)
  })

  it("accepts null to clear the vision link", async () => {
    const res = await putProject("p-1", { visionItemId: null })
    expect(res.status).toBe(200)
    expect(belongsMock).not.toHaveBeenCalled()
  })
})
