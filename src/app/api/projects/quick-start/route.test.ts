import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    project: {
      count: vi.fn(),
      create: vi.fn(),
    },
    yearlyPlan: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    area: {
      findFirst: vi.fn(),
    },
  },
}))

import { db } from "@/lib/db"
import { POST } from "./route"

const projectDb = vi.mocked(db.project)
const planDb = vi.mocked(db.yearlyPlan)
const areaDb = vi.mocked(db.area)

describe("POST /api/projects/quick-start", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession({ planTier: "FREE" }))
    planDb.findFirst.mockResolvedValue({ id: "plan-1" } as never)
    projectDb.count.mockResolvedValue(0)
    areaDb.findFirst.mockResolvedValue(null)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Run a 5K", category: "HEALTH" }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it("returns 402 when project limit is reached", async () => {
    projectDb.count.mockResolvedValue(3)
    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Run a 5K", category: "HEALTH" }),
      }),
    )
    expect(res.status).toBe(402)
    const json = await res.json()
    expect(json.error).toBe("PROJECT_LIMIT")
    expect(json.upgradeUrl).toBe("/pricing")
    expect(projectDb.create).not.toHaveBeenCalled()
  })

  it("returns 404 when areaId does not belong to user", async () => {
    areaDb.findFirst.mockResolvedValue(null)
    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Run a 5K",
          category: "HEALTH",
          areaId: "area-other",
        }),
      }),
    )
    expect(res.status).toBe(404)
    expect(projectDb.create).not.toHaveBeenCalled()
  })

  it("creates project with areaId and area category", async () => {
    areaDb.findFirst.mockResolvedValue({
      id: "area-health",
      category: "HEALTH",
    } as never)
    projectDb.create.mockResolvedValue({
      id: "proj-new",
      areaId: "area-health",
    } as never)

    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Run a 5K",
          category: "CAREER",
          areaId: "area-health",
        }),
      }),
    )

    expect(res.status).toBe(201)
    expect(projectDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          areaId: "area-health",
          category: "HEALTH",
          title: "Run a 5K",
        }),
      }),
    )
  })

  it("creates project without areaId", async () => {
    projectDb.create.mockResolvedValue({ id: "proj-new", areaId: null } as never)
    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Read 24 books", category: "PASSION" }),
      }),
    )
    expect(res.status).toBe(201)
    expect(projectDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          areaId: null,
          category: "PASSION",
        }),
      }),
    )
  })

  it("auto-links default area when areaId omitted", async () => {
    areaDb.findFirst.mockResolvedValue({ id: "area-passion" } as never)
    projectDb.create.mockResolvedValue({
      id: "proj-new",
      areaId: "area-passion",
    } as never)

    const res = await POST(
      new Request("http://localhost/api/projects/quick-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Paint more", category: "PASSION" }),
      }),
    )

    expect(res.status).toBe(201)
    expect(projectDb.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          areaId: "area-passion",
          category: "PASSION",
        }),
      }),
    )
  })
})
