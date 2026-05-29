import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/cron/weekly-rhythm", () => ({
  runWeeklyRhythmCron: vi.fn(),
  verifyCronSecret: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  sendWeeklyPlan: vi.fn(),
}))

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>()
  return {
    ...actual,
    getIsoWeekContext: () => ({ weekNumber: 20, year: 2026 }),
  }
})

import {
  runWeeklyRhythmCron,
  verifyCronSecret,
} from "@/lib/cron/weekly-rhythm"
import { sendWeeklyPlan } from "@/lib/email"
import { GET } from "./route"

const runMock = vi.mocked(runWeeklyRhythmCron)
const verifyMock = vi.mocked(verifyCronSecret)
const sendPlanMock = vi.mocked(sendWeeklyPlan)

function cronRequest() {
  return new Request("http://localhost/api/cron/weekly-plan", {
    headers: { authorization: "Bearer test-cron-secret" },
  })
}

describe("GET /api/cron/weekly-plan", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyMock.mockReturnValue(true)
    runMock.mockImplementation(async ({ send }) => {
      await send("user@example.com", 20, "User")
      return {
        kind: "plan",
        weekNumber: 20,
        year: 2026,
        usersNotified: 1,
        usersSkipped: 0,
        usersSkippedDedupe: 0,
        usersSkippedTimezone: 0,
        sent: ["user@example.com"],
      }
    })
  })

  it("returns 401 when cron secret is invalid", async () => {
    verifyMock.mockReturnValue(false)
    const res = await GET(cronRequest())
    expect(res.status).toBe(401)
  })

  it("runs plan rhythm cron with ISO week number", async () => {
    const res = await GET(cronRequest())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.kind).toBe("plan")
    expect(runMock).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "plan" }),
    )
    expect(sendPlanMock).toHaveBeenCalledWith(
      "user@example.com",
      20,
      "User",
    )
  })
})
