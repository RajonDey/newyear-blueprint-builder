import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

const txMocks = vi.hoisted(() => ({
  weeklyCheckIn: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findFirst: vi.fn(),
  },
  projectCheckIn: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  streak: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  achievement: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock("@/lib/db", () => ({
  db: {
    yearlyPlan: { findFirst: vi.fn() },
    project: { findMany: vi.fn() },
    weeklyCheckIn: { findMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn((fn: (tx: typeof txMocks) => unknown) => fn(txMocks)),
  },
}))

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>()
  return {
    ...actual,
    getIsoWeekContextInTimeZone: () => ({ weekNumber: 20, year: 2026 }),
    getPreviousIsoWeekContext: () => ({ weekNumber: 19, year: 2026 }),
  }
})

import { db } from "@/lib/db"
import { GET, POST } from "./route"

const planDb = vi.mocked(db.yearlyPlan)
const projectDb = vi.mocked(db.project)
const weeklyListDb = vi.mocked(db.weeklyCheckIn)

const validBody = {
  planId: "plan-1",
  overallMood: 4,
  projectCheckIns: [{ projectId: "project-1", progressRating: 3 }],
}

function postWeekly(body: unknown) {
  return POST(
    new Request("http://localhost/api/check-ins/weekly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  )
}

describe("GET /api/check-ins/weekly", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    weeklyListDb.findMany.mockResolvedValue([])
    weeklyListDb.count.mockResolvedValue(0)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await GET(new Request("http://localhost/api/check-ins/weekly"))
    expect(res.status).toBe(401)
  })
})

describe("POST /api/check-ins/weekly", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    planDb.findFirst.mockResolvedValue({
      id: "plan-1",
      user: { timezone: "UTC" },
    } as unknown as Awaited<ReturnType<typeof planDb.findFirst>>)
    projectDb.findMany.mockResolvedValue([
      { id: "project-1" },
    ] as unknown as Awaited<ReturnType<typeof projectDb.findMany>>)
    txMocks.streak.findUnique.mockResolvedValue({ currentStreak: 2 })
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await postWeekly(validBody)
    expect(res.status).toBe(401)
  })

  it("returns 404 when plan does not belong to user", async () => {
    planDb.findFirst.mockResolvedValue(null)
    const res = await postWeekly(validBody)
    expect(res.status).toBe(404)
  })

  it("returns 200 when updating an existing check-in for the same week", async () => {
    txMocks.weeklyCheckIn.findUnique
      .mockResolvedValueOnce({ id: "wci-existing" })
      .mockResolvedValueOnce({
        id: "wci-existing",
        planId: "plan-1",
        weekNumber: 20,
        year: 2026,
        projectCheckIns: [],
      })

    const res = await postWeekly(validBody)
    expect(res.status).toBe(200)
    expect(txMocks.weeklyCheckIn.update).toHaveBeenCalled()
    expect(txMocks.weeklyCheckIn.create).not.toHaveBeenCalled()
    expect(txMocks.streak.upsert).not.toHaveBeenCalled()
  })

  it("returns 201 when creating the first check-in for the week", async () => {
    txMocks.weeklyCheckIn.findUnique.mockResolvedValue(null)
    txMocks.weeklyCheckIn.findFirst.mockResolvedValue(null)
    txMocks.weeklyCheckIn.create.mockResolvedValue({
      id: "wci-new",
      planId: "plan-1",
      weekNumber: 20,
      year: 2026,
      projectCheckIns: [],
    })
    txMocks.streak.findUnique.mockResolvedValue(null)
    txMocks.achievement.findUnique.mockResolvedValue(null)

    const res = await postWeekly(validBody)
    expect(res.status).toBe(201)
    expect(txMocks.weeklyCheckIn.create).toHaveBeenCalled()
    expect(txMocks.streak.upsert).toHaveBeenCalled()
  })
})
