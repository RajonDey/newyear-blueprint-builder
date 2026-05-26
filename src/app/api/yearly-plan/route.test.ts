import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    yearlyPlan: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => unknown) =>
      fn({
        yearlyPlan: {
          create: vi.fn(),
        },
      }),
    ),
  },
}))

vi.mock("@/lib/areas/default-areas", () => ({
  ensureDefaultAreasForUser: vi.fn(),
}))

import { db } from "@/lib/db"
import { ensureDefaultAreasForUser } from "@/lib/areas/default-areas"
import { POST } from "./route"

const planDb = vi.mocked(db.yearlyPlan)
const ensureAreas = vi.mocked(ensureDefaultAreasForUser)

describe("POST /api/yearly-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession({ planTier: "FREE" }))
    planDb.findFirst.mockResolvedValue(null)
    planDb.findUnique.mockResolvedValue(null)
    planDb.count.mockResolvedValue(0)
    ensureAreas.mockResolvedValue(undefined)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await POST(
      new Request("http://localhost/api/yearly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: 2027, theme: "Momentum" }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it("returns 409 when an active plan exists", async () => {
    planDb.findFirst.mockResolvedValue({ id: "plan-active" } as never)
    const res = await POST(
      new Request("http://localhost/api/yearly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: 2027, theme: "Momentum" }),
      }),
    )
    expect(res.status).toBe(409)
  })

  it("returns 402 when free user is at plan cap", async () => {
    planDb.count.mockResolvedValue(1)
    const res = await POST(
      new Request("http://localhost/api/yearly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: 2027, theme: "Momentum" }),
      }),
    )
    expect(res.status).toBe(402)
    const json = await res.json()
    expect(json.error).toBe("PLAN_LIMIT")
    expect(json.upgradeUrl).toBe("/pricing")
  })

  it("returns 201 when under limit", async () => {
    const txCreate = vi.fn().mockResolvedValue({
      id: "plan-new",
      year: 2027,
      status: "ACTIVE",
      reflections: { theme: "Momentum" },
    })
    vi.mocked(db.$transaction).mockImplementation(async (fn) =>
      fn({ yearlyPlan: { create: txCreate } } as never),
    )

    const res = await POST(
      new Request("http://localhost/api/yearly-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: 2027, theme: "Momentum" }),
      }),
    )
    expect(res.status).toBe(201)
    expect(txCreate).toHaveBeenCalled()
    expect(ensureAreas).toHaveBeenCalled()
  })
})
