import { describe, expect, it } from "vitest"
import { countExportRows, MAX_EXPORT_ROWS } from "@/lib/queries/user-export"

const emptyBundle = {
  user: {
    id: "u1",
    name: null,
    email: "a@b.com",
    timezone: "UTC",
    planTier: "FREE",
    preferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  areas: [],
  vision: null,
  yearlyPlans: [],
  antiGoals: [],
  wheel: [],
  projects: [],
  tasks: [],
  systems: [],
  notes: [],
  resources: [],
  drifts: [],
  dailyStates: [],
  checkIns: { weekly: [], project: [] },
  weeklyPlans: [],
  monthlyPlans: [],
  monthlyReviews: [],
  quarterlyPlans: [],
  quarterlyReviews: [],
  streaks: [],
  achievements: [],
  reviewTemplates: [],
}

describe("countExportRows", () => {
  it("returns zero for an empty account", () => {
    expect(countExportRows(emptyBundle)).toBe(0)
  })

  it("counts nested system completions", () => {
    const count = countExportRows({
      ...emptyBundle,
      systems: [
        {
          id: "s1",
          projectId: "p1",
          description: "Run",
          frequency: "DAILY",
          isActive: true,
          completions: [{ id: "c1" }, { id: "c2" }],
        },
      ] as never,
      projects: [{ id: "p1" }] as never,
    })
    expect(count).toBe(4)
  })

  it("counts vision board items", () => {
    const count = countExportRows({
      ...emptyBundle,
      vision: {
        id: "v1",
        userId: "u1",
        northStar: "Grow",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [{ id: "vi1" }, { id: "vi2" }],
      } as never,
    })
    expect(count).toBe(3)
  })
})

describe("MAX_EXPORT_ROWS", () => {
  it("is 10k", () => {
    expect(MAX_EXPORT_ROWS).toBe(10_000)
  })
})
