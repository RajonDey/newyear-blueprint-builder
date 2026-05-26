import { describe, expect, it } from "vitest"
import type { GoalStatus } from "@prisma/client"
import { computeAreaHealth } from "@/lib/queries/area-health"

describe("computeAreaHealth", () => {
  it("returns quiet when there are no projects", () => {
    expect(
      computeAreaHealth({
        projects: [],
        category: "HEALTH",
        weeklyAvgRating: null,
        wheelDelta: null,
      }),
    ).toEqual({
      score: null,
      tone: "quiet",
      label: "Quiet — no projects yet",
    })
  })

  it("returns green for healthy on-track projects with good weekly ratings", () => {
    const result = computeAreaHealth({
      projects: [{ status: "ON_TRACK" as GoalStatus }],
      category: "CAREER",
      weeklyAvgRating: 4.5,
      wheelDelta: 1,
    })
    expect(result.tone).toBe("green")
    expect(result.score).toBeGreaterThanOrEqual(65)
  })

  it("returns amber when a project is at risk even with a decent score", () => {
    const result = computeAreaHealth({
      projects: [
        { status: "ON_TRACK" as GoalStatus },
        { status: "AT_RISK" as GoalStatus },
      ],
      category: "HEALTH",
      weeklyAvgRating: 4,
      wheelDelta: 0,
    })
    expect(result.tone).toBe("amber")
    expect(result.label).toContain("at risk")
  })

  it("uses neutral weekly rhythm when no check-ins exist", () => {
    const withRatings = computeAreaHealth({
      projects: [{ status: "IN_PROGRESS" as GoalStatus }],
      category: null,
      weeklyAvgRating: 5,
      wheelDelta: null,
    })
    const withoutRatings = computeAreaHealth({
      projects: [{ status: "IN_PROGRESS" as GoalStatus }],
      category: null,
      weeklyAvgRating: null,
      wheelDelta: null,
    })
    expect(withRatings.score).toBeGreaterThan(withoutRatings.score ?? 0)
  })
})
