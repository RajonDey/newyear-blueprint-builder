import { beforeEach, describe, expect, it, vi } from "vitest"

const { update } = vi.hoisted(() => ({
  update: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: { update },
  },
}))

import { sendRhythmEmailIfEligible } from "@/lib/cron/send-rhythm-email"

describe("sendRhythmEmailIfEligible", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({})
  })

  it("skips when preference is off", async () => {
    const send = vi.fn()
    const result = await sendRhythmEmailIfEligible({
      userId: "u1",
      email: "a@example.com",
      preferences: { emailPreferences: { weeklyReviewReminder: false } },
      preferenceKey: "weeklyReviewReminder",
      send,
    })
    expect(result).toEqual({ status: "skipped", reason: "preference" })
    expect(send).not.toHaveBeenCalled()
  })

  it("skips when dedupe blocks same UTC day", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-27T10:00:00.000Z"))

    const send = vi.fn()
    const result = await sendRhythmEmailIfEligible({
      userId: "u1",
      email: "a@example.com",
      preferences: { emailMeta: { lastRhythmEmailDate: "2026-05-27" } },
      preferenceKey: "weeklyReviewReminder",
      send,
    })
    expect(result).toEqual({ status: "skipped", reason: "dedupe" })
    expect(send).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it("sends and marks rhythm email date on success", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-05-27T10:00:00.000Z"))

    const send = vi.fn().mockResolvedValue({ id: "email-1" })
    const result = await sendRhythmEmailIfEligible({
      userId: "u1",
      email: "a@example.com",
      preferences: {},
      preferenceKey: "weeklyReviewReminder",
      send,
    })

    expect(result).toEqual({ status: "sent" })
    expect(send).toHaveBeenCalledTimes(1)
    expect(update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        preferences: expect.objectContaining({
          emailMeta: { lastRhythmEmailDate: "2026-05-27" },
        }),
      },
    })

    vi.useRealTimers()
  })
})
