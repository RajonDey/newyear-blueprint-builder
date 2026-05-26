import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/db", () => ({
  db: {
    user: { findUnique: vi.fn() },
    antiGoal: { findFirst: vi.fn() },
  },
}))

vi.mock("@/lib/queries/today", () => ({
  getDailyStateForDate: vi.fn(),
  upsertDailyState: vi.fn(),
}))

import { db } from "@/lib/db"
import {
  getDailyStateForDate,
  upsertDailyState,
} from "@/lib/queries/today"
import { PATCH } from "./route"

const userDb = vi.mocked(db.user)
const antiGoalDb = vi.mocked(db.antiGoal)
const getState = vi.mocked(getDailyStateForDate)
const upsert = vi.mocked(upsertDailyState)

describe("PATCH /api/today", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    userDb.findUnique.mockResolvedValue({ timezone: "UTC" } as never)
    antiGoalDb.findFirst.mockResolvedValue({ id: "ag-1" } as never)
    upsert.mockResolvedValue({
      id: "ds-1",
      antiGoalHeldId: "ag-1",
      antiGoalHeld: true,
    } as never)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await PATCH(
      new Request("http://localhost/api/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antiGoalHeldId: "ag-1", antiGoalHeld: true }),
      }),
    )
    expect(res.status).toBe(401)
  })

  it("returns 404 when anti-goal is not owned", async () => {
    antiGoalDb.findFirst.mockResolvedValue(null)
    const res = await PATCH(
      new Request("http://localhost/api/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antiGoalHeldId: "ag-other", antiGoalHeld: true }),
      }),
    )
    expect(res.status).toBe(404)
    expect(upsert).not.toHaveBeenCalled()
  })

  it("upserts anti-goal held columns", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "2026-05-21",
          antiGoalHeldId: "ag-1",
          antiGoalHeld: true,
        }),
      }),
    )
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        antiGoalHeldId: "ag-1",
        antiGoalHeld: true,
      }),
    )
  })

  it("clears anti-goal columns when antiGoalHeld is null", async () => {
    const res = await PATCH(
      new Request("http://localhost/api/today", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ antiGoalHeld: null }),
      }),
    )
    expect(res.status).toBe(200)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        antiGoalHeldId: null,
        antiGoalHeld: null,
      }),
    )
  })
})

describe("GET /api/today", () => {
  it("returns daily state for date", async () => {
    getState.mockResolvedValue({ id: "ds-1", reflection: "Hi" } as never)
    const { GET } = await import("./route")
    const res = await GET(
      new Request("http://localhost/api/today?date=2026-05-21"),
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.date).toBe("2026-05-21")
    expect(json.data.reflection).toBe("Hi")
  })
})
