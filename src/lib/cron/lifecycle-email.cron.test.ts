import { beforeEach, describe, expect, it, vi } from "vitest"

const { findMany, update } = vi.hoisted(() => ({
  findMany: vi.fn(),
  update: vi.fn(),
}))

vi.mock("@/lib/db", () => ({
  db: {
    user: { findMany, update },
  },
}))

vi.mock("@/lib/email", () => ({
  sendFinishOnboardingEmail: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  sendNewYearSetupEmail: vi.fn(),
  sendYearReflectionEmail: vi.fn(),
}))

import {
  sendFinishOnboardingEmail,
  sendNewYearSetupEmail,
  sendWelcomeEmail,
  sendYearReflectionEmail,
} from "@/lib/email"
import { runLifecycleCron } from "@/lib/cron/lifecycle-email"

const finishMock = vi.mocked(sendFinishOnboardingEmail)
const welcomeMock = vi.mocked(sendWelcomeEmail)
const newYearMock = vi.mocked(sendNewYearSetupEmail)
const yearReflectionMock = vi.mocked(sendYearReflectionEmail)

describe("runLifecycleCron", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({})
    finishMock.mockResolvedValue({ id: "email-1" })
    welcomeMock.mockResolvedValue({ id: "email-2" })
    newYearMock.mockResolvedValue({ id: "email-3" })
    yearReflectionMock.mockResolvedValue({ id: "email-4" })
    findMany.mockResolvedValue([])
  })

  it("sends finish onboarding to ghost users once", async () => {
    findMany.mockImplementation(async (args) => {
      if (args?.where?.yearlyPlans?.none) {
        return [
          {
            id: "u1",
            email: "ghost@example.com",
            name: "Ghost",
            preferences: {},
          },
        ]
      }
      return []
    })

    const summary = await runLifecycleCron(new Date("2026-05-27T10:00:00.000Z"))

    expect(summary.finishOnboarding.sent).toBe(1)
    expect(finishMock).toHaveBeenCalledWith("ghost@example.com", "Ghost")
  })

  it("sends welcome fallback when plan exists but welcome not marked", async () => {
    findMany.mockImplementation(async (args) => {
      if (args?.where?.yearlyPlans?.none) return []
      if (args?.select?.yearlyPlans) return []
      if (args?.where?.yearlyPlans?.some) {
        return [
          {
            id: "u2",
            email: "active@example.com",
            name: "Active",
            preferences: {},
          },
        ]
      }
      return []
    })

    const summary = await runLifecycleCron(new Date("2026-05-27T10:00:00.000Z"))

    expect(summary.welcomeFallback.sent).toBe(1)
    expect(welcomeMock).toHaveBeenCalledWith("active@example.com", "Active")
  })

  it("sends new year setup during Jan 2–7 in user timezone", async () => {
    findMany.mockImplementation(async (args) => {
      if (args?.where?.yearlyPlans?.none) return []
      if (args?.select?.yearlyPlans?.select) {
        return [
          {
            id: "u3",
            email: "returning@example.com",
            name: "Return",
            preferences: {},
            timezone: "UTC",
            yearlyPlans: [{ year: 2025, status: "ARCHIVED" }],
          },
        ]
      }
      if (args?.where?.yearlyPlans?.some?.status === "ACTIVE") return []
      return []
    })

    const summary = await runLifecycleCron(new Date("2026-01-03T10:00:00.000Z"))

    expect(summary.newYearSetup.sent).toBe(1)
    expect(newYearMock).toHaveBeenCalledWith(
      "returning@example.com",
      2026,
      "Return",
    )
  })

  it("sends year reflection during Dec 20–28 in user timezone", async () => {
    findMany.mockImplementation(async (args) => {
      if (args?.where?.yearlyPlans?.none) return []
      if (
        args?.where?.yearlyPlans?.some?.status === "ACTIVE" &&
        args?.select?.yearlyPlans?.where?.status === "ACTIVE"
      ) {
        return [
          {
            id: "u4",
            email: "active@example.com",
            name: "Active",
            preferences: {},
            timezone: "UTC",
            yearlyPlans: [{ year: 2026 }],
          },
        ]
      }
      return []
    })

    const summary = await runLifecycleCron(new Date("2026-12-22T10:00:00.000Z"))

    expect(summary.yearReflection.sent).toBe(1)
    expect(yearReflectionMock).toHaveBeenCalledWith(
      "active@example.com",
      2026,
      "Active",
    )
  })
})
