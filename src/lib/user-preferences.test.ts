import { describe, expect, it } from "vitest"
import {
  getEmailPreferences,
  isEmailPreferenceEnabled,
  isWeekOneChecklistDismissed,
  mergeUserPreferences,
  parseUserPreferences,
} from "@/lib/user-preferences"

describe("parseUserPreferences", () => {
  it("returns empty object for invalid input", () => {
    expect(parseUserPreferences(null)).toEqual({})
    expect(parseUserPreferences([])).toEqual({})
  })

  it("parses week-one checklist fields", () => {
    expect(
      parseUserPreferences({
        weekOneChecklist: {
          dismissedAt: "2026-05-21T12:00:00.000Z",
          visitedVisionAt: "2026-05-21T13:00:00.000Z",
        },
      }),
    ).toEqual({
      weekOneChecklist: {
        dismissedAt: "2026-05-21T12:00:00.000Z",
        visitedVisionAt: "2026-05-21T13:00:00.000Z",
      },
    })
  })

  it("parses email preferences independently of week-one checklist", () => {
    expect(
      parseUserPreferences({
        emailPreferences: {
          weeklyReviewReminder: false,
          monthlyNudge: true,
        },
      }),
    ).toEqual({
      emailPreferences: {
        weeklyReviewReminder: false,
        monthlyNudge: true,
      },
    })
  })

  it("parses lifecycle emailMeta fields", () => {
    expect(
      parseUserPreferences({
        emailMeta: {
          welcomeSentAt: "2026-05-27T10:00:00.000Z",
          newYearSetupYear: 2026,
          yearReflectionYear: 2025,
        },
      }),
    ).toEqual({
      emailMeta: {
        welcomeSentAt: "2026-05-27T10:00:00.000Z",
        newYearSetupYear: 2026,
        yearReflectionYear: 2025,
      },
    })
  })
})

describe("mergeUserPreferences", () => {
  it("merges nested week-one checklist without dropping existing keys", () => {
    const merged = mergeUserPreferences(
      { weekOneChecklist: { visitedVisionAt: "a" } },
      { weekOneChecklist: { dismissedAt: "b" } },
    )
    expect(merged.weekOneChecklist?.visitedVisionAt).toBe("a")
    expect(merged.weekOneChecklist?.dismissedAt).toBe("b")
  })

  it("merges email preferences without dropping existing keys", () => {
    const merged = mergeUserPreferences(
      { emailPreferences: { weeklyReviewReminder: false } },
      { emailPreferences: { monthlyNudge: false } },
    )
    expect(merged.emailPreferences?.weeklyReviewReminder).toBe(false)
    expect(merged.emailPreferences?.monthlyNudge).toBe(false)
  })
})

describe("getEmailPreferences", () => {
  it("defaults all email toggles to true", () => {
    expect(getEmailPreferences({})).toEqual({
      weeklyReviewReminder: true,
      monthlyNudge: true,
      quarterlyNudge: true,
      dailyNudge: true,
    })
  })

  it("respects explicit false values", () => {
    expect(
      getEmailPreferences({
        emailPreferences: { weeklyReviewReminder: false },
      }).weeklyReviewReminder,
    ).toBe(false)
  })
})

describe("isEmailPreferenceEnabled", () => {
  it("returns true when preference is unset", () => {
    expect(isEmailPreferenceEnabled({}, "weeklyReviewReminder")).toBe(true)
  })

  it("returns false when preference is explicitly disabled", () => {
    expect(
      isEmailPreferenceEnabled(
        { emailPreferences: { weeklyReviewReminder: false } },
        "weeklyReviewReminder",
      ),
    ).toBe(false)
  })
})

describe("isWeekOneChecklistDismissed", () => {
  it("returns true when dismissedAt is set", () => {
    expect(
      isWeekOneChecklistDismissed({
        weekOneChecklist: { dismissedAt: "2026-05-21" },
      }),
    ).toBe(true)
  })
})
