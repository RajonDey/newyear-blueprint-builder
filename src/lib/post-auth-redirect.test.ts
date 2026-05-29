import { describe, expect, it } from "vitest"
import {
  buildAuthContinueUrl,
  resolvePostAuthRedirect,
  sanitizeCallbackPath,
} from "@/lib/post-auth-redirect"

describe("sanitizeCallbackPath", () => {
  it("accepts safe relative paths", () => {
    expect(sanitizeCallbackPath("/pricing")).toBe("/pricing")
    expect(sanitizeCallbackPath("/settings#billing")).toBe("/settings#billing")
  })

  it("extracts path from full URLs", () => {
    expect(sanitizeCallbackPath("https://yearinreview.online/pricing")).toBe(
      "/pricing",
    )
  })

  it("rejects auth routes, api routes, and external URLs", () => {
    expect(sanitizeCallbackPath("/login")).toBeNull()
    expect(sanitizeCallbackPath("/signup")).toBeNull()
    expect(sanitizeCallbackPath("/auth/continue")).toBeNull()
    expect(sanitizeCallbackPath("/api/export")).toBeNull()
    expect(sanitizeCallbackPath("//evil.com/phish")).toBeNull()
    expect(sanitizeCallbackPath("")).toBeNull()
  })
})

describe("resolvePostAuthRedirect", () => {
  it("sends new users to onboarding regardless of callback", () => {
    expect(
      resolvePostAuthRedirect({
        yearlyPlanCount: 0,
        callbackUrl: "/pricing",
      }),
    ).toBe("/onboarding")
  })

  it("honors callback for returning users", () => {
    expect(
      resolvePostAuthRedirect({
        yearlyPlanCount: 1,
        callbackUrl: "/pricing",
      }),
    ).toBe("/pricing")
  })

  it("falls back to dashboard for returning users without callback", () => {
    expect(
      resolvePostAuthRedirect({
        yearlyPlanCount: 2,
        callbackUrl: null,
      }),
    ).toBe("/dashboard")
  })
})

describe("buildAuthContinueUrl", () => {
  it("builds continue URL with encoded callback", () => {
    expect(buildAuthContinueUrl("/settings")).toBe(
      "/auth/continue?callbackUrl=%2Fsettings",
    )
  })

  it("omits query when callback is unsafe", () => {
    expect(buildAuthContinueUrl("/login")).toBe("/auth/continue")
  })
})
