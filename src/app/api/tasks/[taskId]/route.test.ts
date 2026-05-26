import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    task: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import { PATCH } from "./route"

const taskDb = vi.mocked(db.task)

describe("PATCH /api/tasks/[taskId]", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await PATCH(
      new Request("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: true }),
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )
    expect(res.status).toBe(401)
  })

  it("returns 404 when task does not belong to user", async () => {
    taskDb.findFirst.mockResolvedValue(null)
    const res = await PATCH(
      new Request("http://localhost/api/tasks/task-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: true }),
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe("Task not found")
  })
})
