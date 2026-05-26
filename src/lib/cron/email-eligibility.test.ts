import { describe, expect, it } from "vitest"
import { shouldSendEmail } from "@/lib/cron/email-eligibility"

describe("shouldSendEmail", () => {
  it("defaults to sending when preferences are missing", () => {
    expect(shouldSendEmail(null, "weeklyReviewReminder")).toBe(true)
  })

  it("skips when weekly review reminder is disabled", () => {
    expect(
      shouldSendEmail(
        { emailPreferences: { weeklyReviewReminder: false } },
        "weeklyReviewReminder",
      ),
    ).toBe(false)
  })

  it("respects monthly nudge opt-out", () => {
    expect(
      shouldSendEmail(
        { emailPreferences: { monthlyNudge: false } },
        "monthlyNudge",
      ),
    ).toBe(false)
  })
})
