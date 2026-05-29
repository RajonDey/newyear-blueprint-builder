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
import { runQuarterlyRhythmCron } from "@/lib/cron/quarterly-rhythm"

const sendRhythmMock = vi.mocked(sendRhythmEmailIfEligible)

describe("runQuarterlyRhythmCron", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sendRhythmMock.mockImplementation(async ({ send }) => {
      await send()
      return { status: "sent" }
    })
  })

  it("sends plan emails when QuarterlyPlan is missing", async () => {
    findMany.mockResolvedValue([
      {
        quarterlyPlans: [],
        quarterlyReviews: [{ id: "qr-1" }],
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
    const result = await runQuarterlyRhythmCron({
      kind: "plan",
      now: new Date("2026-04-06T08:00:00.000Z"),
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("plan")
    expect(result.quarter).toBe("Q2")
    expect(result.usersNotified).toBe(1)
  })

  it("sends review emails when QuarterlyReview is missing", async () => {
    findMany.mockResolvedValue([
      {
        quarterlyPlans: [{ id: "qp-1" }],
        quarterlyReviews: [],
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
    const result = await runQuarterlyRhythmCron({
      kind: "review",
      now: new Date("2026-06-15T17:00:00.000Z"),
      send,
      requireTimezoneWindow: false,
    })

    expect(result.kind).toBe("review")
    expect(result.quarter).toBe("Q2")
    expect(result.usersNotified).toBe(1)
  })
})
