import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findFirst: vi.fn(),
    },
    task: {
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import { POST } from "./route"

const projectDb = vi.mocked(db.project)
const taskDb = vi.mocked(db.task)

describe("POST /api/projects/[projectId]/tasks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession({ planTier: "FREE" }))
    projectDb.findFirst.mockResolvedValue({ id: "proj-1" } as never)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await POST(
      new Request("http://localhost/api/projects/proj-1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Ship draft" }),
      }),
      { params: Promise.resolve({ projectId: "proj-1" }) },
    )
    expect(res.status).toBe(401)
  })

  it("returns 402 when task limit is reached", async () => {
    taskDb.count.mockResolvedValue(10)
    const res = await POST(
      new Request("http://localhost/api/projects/proj-1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Ship draft" }),
      }),
      { params: Promise.resolve({ projectId: "proj-1" }) },
    )
    expect(res.status).toBe(402)
    const json = await res.json()
    expect(json.error).toBe("TASK_LIMIT")
    expect(json.upgradeUrl).toBe("/pricing")
    expect(taskDb.create).not.toHaveBeenCalled()
  })

  it("returns 201 when under limit", async () => {
    taskDb.count.mockResolvedValue(2)
    taskDb.create.mockResolvedValue({
      id: "task-new",
      description: "Ship draft",
    } as never)

    const res = await POST(
      new Request("http://localhost/api/projects/proj-1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "Ship draft" }),
      }),
      { params: Promise.resolve({ projectId: "proj-1" }) },
    )

    expect(res.status).toBe(201)
    expect(taskDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: "proj-1",
          description: "Ship draft",
        }),
      }),
    )
  })
})
