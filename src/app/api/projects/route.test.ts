import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    yearlyPlan: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock("@/lib/areas/default-areas", () => ({
  findDefaultAreaIdForCategory: vi.fn(),
}))

import { db } from "@/lib/db"
import { findDefaultAreaIdForCategory } from "@/lib/areas/default-areas"
import { GET, POST } from "./route"

const projectDb = vi.mocked(db.project)
const planDb = vi.mocked(db.yearlyPlan)
const findDefaultArea = vi.mocked(findDefaultAreaIdForCategory)

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    projectDb.findMany.mockResolvedValue([])
    projectDb.count.mockResolvedValue(0)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await GET(new Request("http://localhost/api/projects"))
    expect(res.status).toBe(401)
  })

  it("returns paginated list shape", async () => {
    const res = await GET(new Request("http://localhost/api/projects?page=1&limit=10"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    })
    expect(json.data).toEqual([])
  })
})

describe("POST /api/projects", () => {
  const validBody = {
    planId: "plan-1",
    category: "HEALTH",
    type: "PRIMARY",
    title: "Run a 5K",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession({ planTier: "FREE" }))
    planDb.findFirst.mockResolvedValue({ id: "plan-1" } as never)
    findDefaultArea.mockResolvedValue("area-health")
  })

  it("returns 402 when project limit is reached", async () => {
    projectDb.count.mockResolvedValue(3)
    const res = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    )
    expect(res.status).toBe(402)
    const json = await res.json()
    expect(json.error).toBe("PROJECT_LIMIT")
    expect(json.upgradeUrl).toBe("/pricing")
    expect(projectDb.create).not.toHaveBeenCalled()
  })

  it("returns 201 when under limit", async () => {
    projectDb.count.mockResolvedValue(1)
    projectDb.create.mockResolvedValue({ id: "proj-new", title: "Run a 5K" } as never)
    const res = await POST(
      new Request("http://localhost/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    )
    expect(res.status).toBe(201)
    expect(projectDb.create).toHaveBeenCalled()
  })
})
