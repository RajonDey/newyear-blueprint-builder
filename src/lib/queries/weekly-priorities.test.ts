import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    yearlyPlan: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
    weeklyPlan: { findUnique: vi.fn() },
    project: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/utils", () => ({
  getIsoWeekContextInTimeZone: vi.fn(() => ({ weekNumber: 21, year: 2026 })),
}))

import { db } from "@/lib/db"
import {
  getWeeklyPriorityProjectIds,
  getWeeklyPriorityProjects,
} from "@/lib/queries/weekly-priorities"

describe("getWeeklyPriorityProjectIds", () => {
  beforeEach(() => {
    vi.mocked(db.yearlyPlan.findFirst).mockResolvedValue({ id: "plan-1" } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ timezone: "UTC" } as never)
  })

  it("returns empty array when no weekly plan exists", async () => {
    vi.mocked(db.weeklyPlan.findUnique).mockResolvedValue(null)

    await expect(getWeeklyPriorityProjectIds("user-1")).resolves.toEqual([])
  })

  it("returns ordered ids from the weekly plan", async () => {
    vi.mocked(db.weeklyPlan.findUnique).mockResolvedValue({
      priorityProjectIds: ["p-b", "p-a"],
    } as never)

    await expect(
      getWeeklyPriorityProjectIds("user-1", { weekNumber: 10, year: 2026 }),
    ).resolves.toEqual(["p-b", "p-a"])
  })
})

describe("getWeeklyPriorityProjects", () => {
  beforeEach(() => {
    vi.mocked(db.yearlyPlan.findFirst).mockResolvedValue({ id: "plan-1" } as never)
    vi.mocked(db.user.findUnique).mockResolvedValue({ timezone: "UTC" } as never)
  })

  it("preserves weekly-plan order when resolving titles", async () => {
    vi.mocked(db.weeklyPlan.findUnique).mockResolvedValue({
      priorityProjectIds: ["p-b", "p-a"],
      protectCategory: "HEALTH",
    } as never)
    vi.mocked(db.project.findMany).mockResolvedValue([
      { id: "p-a", title: "Alpha" },
      { id: "p-b", title: "Beta" },
    ] as never)

    const result = await getWeeklyPriorityProjects("user-1")
    expect(result?.projects).toEqual([
      { id: "p-b", title: "Beta" },
      { id: "p-a", title: "Alpha" },
    ])
    expect(result?.protectCategory).toBe("HEALTH")
  })
})
