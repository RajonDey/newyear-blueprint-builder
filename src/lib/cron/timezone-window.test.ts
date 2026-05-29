import { describe, expect, it } from "vitest"
import {
  getLocalHour,
  getLocalWeekday,
  getQuarterInTimeZone,
  isInLocalSendWindow,
  isNewYearSetupWindowForUser,
  isYearReflectionWindowForUser,
  RHYTHM_SEND_WINDOWS,
} from "@/lib/cron/timezone-window"

describe("isInLocalSendWindow", () => {
  it("matches Sunday 6 PM in America/New_York", () => {
    // 2026-05-24 is Sunday; 22:00 UTC = 6 PM EDT (UTC-4)
    expect(
      isInLocalSendWindow(
        new Date("2026-05-24T22:00:00.000Z"),
        "America/New_York",
        RHYTHM_SEND_WINDOWS.weeklyPlan,
      ),
    ).toBe(true)
  })

  it("rejects wrong weekday at target hour", () => {
    // Monday 6 PM EDT
    expect(
      isInLocalSendWindow(
        new Date("2026-05-25T22:00:00.000Z"),
        "America/New_York",
        RHYTHM_SEND_WINDOWS.weeklyPlan,
      ),
    ).toBe(false)
  })

  it("matches first Monday of quarter at 8 AM local", () => {
    // 2026-01-05 is Monday; 13:00 UTC = 8 AM EST
    expect(
      isInLocalSendWindow(
        new Date("2026-01-05T13:00:00.000Z"),
        "America/New_York",
        RHYTHM_SEND_WINDOWS.quarterlyPlan,
      ),
    ).toBe(true)
  })
})

describe("getLocalHour", () => {
  it("returns hour in timezone", () => {
    expect(getLocalHour(new Date("2026-05-27T14:00:00.000Z"), "UTC")).toBe(14)
  })
})

describe("getLocalWeekday", () => {
  it("returns Sunday as 0", () => {
    expect(getLocalWeekday(new Date("2026-05-24T12:00:00.000Z"), "UTC")).toBe(0)
  })
})

describe("getQuarterInTimeZone", () => {
  it("returns Q2 for May", () => {
    expect(getQuarterInTimeZone(new Date("2026-05-15T12:00:00.000Z"), "UTC")).toBe(
      "Q2",
    )
  })
})

describe("lifecycle local windows", () => {
  it("new year setup Jan 2–7 local", () => {
    expect(
      isNewYearSetupWindowForUser(
        new Date("2026-01-03T12:00:00.000Z"),
        "UTC",
      ),
    ).toBe(true)
    expect(
      isNewYearSetupWindowForUser(
        new Date("2026-01-08T12:00:00.000Z"),
        "UTC",
      ),
    ).toBe(false)
  })

  it("year reflection Dec 20–28 local", () => {
    expect(
      isYearReflectionWindowForUser(
        new Date("2026-12-22T12:00:00.000Z"),
        "UTC",
      ),
    ).toBe(true)
    expect(
      isYearReflectionWindowForUser(
        new Date("2026-12-19T12:00:00.000Z"),
        "UTC",
      ),
    ).toBe(false)
  })
})
