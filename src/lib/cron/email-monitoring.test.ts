import { describe, expect, it, vi } from "vitest"
import {
  emailDailyWarnThreshold,
  warnIfHighEmailVolume,
} from "@/lib/cron/email-monitoring"

describe("email monitoring", () => {
  it("warnIfHighEmailVolume logs when at threshold", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    warnIfHighEmailVolume("test-job", emailDailyWarnThreshold())
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it("does not warn below threshold", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    warnIfHighEmailVolume("test-job", 0)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
