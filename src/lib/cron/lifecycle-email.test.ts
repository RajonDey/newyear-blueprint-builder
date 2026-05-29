import { describe, expect, it } from "vitest"
import {
  isNewYearSetupWindow,
  isYearReflectionWindow,
} from "@/lib/cron/lifecycle-email"

describe("isNewYearSetupWindow", () => {
  it("returns true Jan 2–7 UTC", () => {
    expect(isNewYearSetupWindow(new Date("2026-01-02T12:00:00.000Z"))).toBe(true)
    expect(isNewYearSetupWindow(new Date("2026-01-07T23:59:00.000Z"))).toBe(true)
  })

  it("returns false outside Jan 2–7", () => {
    expect(isNewYearSetupWindow(new Date("2026-01-01T12:00:00.000Z"))).toBe(false)
    expect(isNewYearSetupWindow(new Date("2026-01-08T12:00:00.000Z"))).toBe(false)
    expect(isNewYearSetupWindow(new Date("2026-06-15T12:00:00.000Z"))).toBe(false)
  })
})

describe("isYearReflectionWindow", () => {
  it("returns true Dec 20–28 UTC", () => {
    expect(isYearReflectionWindow(new Date("2026-12-20T00:00:00.000Z"))).toBe(true)
    expect(isYearReflectionWindow(new Date("2026-12-28T23:59:00.000Z"))).toBe(true)
  })

  it("returns false outside Dec 20–28", () => {
    expect(isYearReflectionWindow(new Date("2026-12-19T12:00:00.000Z"))).toBe(false)
    expect(isYearReflectionWindow(new Date("2026-12-29T12:00:00.000Z"))).toBe(false)
    expect(isYearReflectionWindow(new Date("2026-06-15T12:00:00.000Z"))).toBe(false)
  })
})
