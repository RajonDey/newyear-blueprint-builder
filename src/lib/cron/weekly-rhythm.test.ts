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

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>()
  return {
    ...actual,
    getIsoWeekContextInTimeZone: () => ({ weekNumber: 20, year: 2026 }),
  }
})

import { sendRhythmEmailIfEligible } from "@/lib/cron/send-rhythm-email"
import { runWeeklyRhythmCron } from "@/lib/cron/weekly-rhythm"

const sendRhythmMock = vi.mocked(sendRhythmEmailIfEligible)

describe("runWeeklyRhythmCron", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendRhythmMock.mockImplementation(async ({ send }) => {
      await send()
      return { status: "sent" }
    })
  })

  it("sends plan emails when WeeklyPlan is missing", async () => {
    findMany.mockResolvedValue([
      {
        weeklyPlans: [],
        weeklyCheckIns: [{ id: "ci-1" }],
        user: {
          id: "u1",
          email: "plan@example.com",
          name: "Planner",
          preferences: {},
          timezone: "UTC",
        },
      },
      {
        weeklyPlans: [{ id: "wp-1", weekNumber: 20, year: 2026 }],
        weeklyCheckIns: [],
        user: {
          id: "u2",
          email: "done@example.com",
          name: "Done",
          preferences: {},
          timezone: "UTC",
        },
      },
    ])

    const send = vi.fn().mockResolvedValue({ id: "email-1" })
    const result = await runWeeklyRhythmCron({
      kind: "plan",
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("plan")
    expect(result.usersNotified).toBe(1)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith("plan@example.com", 20, "Planner")
  })

  it("sends review emails when WeeklyCheckIn is missing", async () => {
    findMany.mockResolvedValue([
      {
        weeklyPlans: [{ id: "wp-1" }],
        weeklyCheckIns: [],
        user: {
          id: "u1",
          email: "review@example.com",
          name: "Reviewer",
          preferences: {},
          timezone: "UTC",
        },
      },
      {
        weeklyPlans: [],
        weeklyCheckIns: [],
        user: {
          id: "u2",
          email: "both@example.com",
          name: "Both",
          preferences: {},
          timezone: "UTC",
        },
      },
    ])

    const send = vi.fn().mockResolvedValue({ id: "email-1" })
    const result = await runWeeklyRhythmCron({
      kind: "review",
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("review")
    expect(result.usersNotified).toBe(2)
    expect(send).toHaveBeenCalledWith("review@example.com", 20, "Reviewer")
    expect(send).toHaveBeenCalledWith("both@example.com", 20, "Both")
  })
})
