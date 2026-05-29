import { describe, expect, it } from "vitest"
import {
  isRhythmEmailBlockedToday,
  mergeRhythmEmailSent,
  rhythmEmailDateKey,
} from "@/lib/cron/email-dedupe"

describe("rhythmEmailDateKey", () => {
  it("returns UTC YYYY-MM-DD", () => {
    expect(rhythmEmailDateKey(new Date("2026-05-27T15:00:00.000Z"))).toBe(
      "2026-05-27",
    )
  })
})

describe("isRhythmEmailBlockedToday", () => {
  it("allows send when no prior rhythm email", () => {
    expect(isRhythmEmailBlockedToday({}, new Date("2026-05-27T12:00:00.000Z"))).toBe(
      false,
    )
  })

  it("blocks when last rhythm email was today UTC", () => {
    expect(
      isRhythmEmailBlockedToday(
        { emailMeta: { lastRhythmEmailDate: "2026-05-27" } },
        new Date("2026-05-27T23:00:00.000Z"),
      ),
    ).toBe(true)
  })

  it("allows when last rhythm email was yesterday", () => {
    expect(
      isRhythmEmailBlockedToday(
        { emailMeta: { lastRhythmEmailDate: "2026-05-26" } },
        new Date("2026-05-27T12:00:00.000Z"),
      ),
    ).toBe(false)
  })

  it("uses user timezone for dedupe day boundary", () => {
    expect(
      isRhythmEmailBlockedToday(
        { emailMeta: { lastRhythmEmailDate: "2026-05-26" } },
        new Date("2026-05-27T02:00:00.000Z"),
        "America/Los_Angeles",
      ),
    ).toBe(true)
  })
})

describe("mergeRhythmEmailSent", () => {
  it("preserves existing preferences", () => {
    const merged = mergeRhythmEmailSent(
      {
        emailPreferences: { weeklyReviewReminder: false },
        weekOneChecklist: { dismissedAt: "2026-01-01T00:00:00.000Z" },
      },
      new Date("2026-05-27T12:00:00.000Z"),
    )
    expect(merged.emailMeta?.lastRhythmEmailDate).toBe("2026-05-27")
    expect(merged.emailPreferences?.weeklyReviewReminder).toBe(false)
    expect(merged.weekOneChecklist?.dismissedAt).toBe("2026-01-01T00:00:00.000Z")
  })
})
