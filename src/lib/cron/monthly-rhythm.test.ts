import { beforeEach, describe, expect, it, vi } from "vitest"

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    yearlyPlan: { findMany },
  },
}))

vi.mock("@/lib/cron/send-rhythm-email", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cron/send-rhythm-email")>()
  return {
    ...actual,
    sendRhythmEmailIfEligible: vi.fn(),
    sleep: vi.fn(),
  }
})

import { sendRhythmEmailIfEligible } from "@/lib/cron/send-rhythm-email"
import { runMonthlyRhythmCron } from "@/lib/cron/monthly-rhythm"

const sendRhythmMock = vi.mocked(sendRhythmEmailIfEligible)

describe("runMonthlyRhythmCron", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendRhythmMock.mockImplementation(async ({ send }) => {
      await send()
      return { status: "sent" }
    })
  })

  it("sends plan emails when MonthlyPlan is missing", async () => {
    findMany.mockResolvedValue([
      {
        monthlyPlans: [],
        monthlyReviews: [{ id: "mr-1" }],
        user: {
          id: "u1",
          email: "plan@example.com",
          name: "Planner",
          preferences: {},
          timezone: "UTC",
        },
      },
    ])

    const send = vi.fn().mockResolvedValue({ id: "email-1" })
    const result = await runMonthlyRhythmCron({
      kind: "plan",
      now: new Date("2026-05-01T08:00:00.000Z"),
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("plan")
    expect(result.month).toBe(5)
    expect(result.usersNotified).toBe(1)
    expect(send).toHaveBeenCalledWith("plan@example.com", "May", "Planner")
  })

  it("sends review emails when MonthlyReview is missing", async () => {
    findMany.mockResolvedValue([
      {
        monthlyPlans: [{ id: "mp-1" }],
        monthlyReviews: [],
        user: {
          id: "u1",
          email: "review@example.com",
          name: "Reviewer",
          preferences: {},
          timezone: "UTC",
        },
      },
    ])

    const send = vi.fn().mockResolvedValue({ id: "email-1" })
    const result = await runMonthlyRhythmCron({
      kind: "review",
      now: new Date("2026-05-25T17:00:00.000Z"),
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("review")
    expect(result.monthLabel).toBe("May")
    expect(result.usersNotified).toBe(1)
  })
})
