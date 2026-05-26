import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    yearlyPlan: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/email", () => ({
  sendWeeklyReminder: vi.fn(),
}))

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>()
  return {
    ...actual,
    getIsoWeekContext: () => ({ weekNumber: 20, year: 2026 }),
  }
})

import { db } from "@/lib/db"
import { sendWeeklyReminder } from "@/lib/email"
import { GET } from "./route"

const planDb = vi.mocked(db.yearlyPlan)
const sendWeeklyReminderMock = vi.mocked(sendWeeklyReminder)

function cronRequest() {
  return new Request("http://localhost/api/cron/weekly-reminder", {
    headers: { authorization: "Bearer test-cron-secret" },
  })
}

describe("GET /api/cron/weekly-reminder", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CRON_SECRET = "test-cron-secret"
    sendWeeklyReminderMock.mockResolvedValue({ id: "email-1" })
  })

  it("returns 401 without cron secret", async () => {
    const res = await GET(new Request("http://localhost/api/cron/weekly-reminder"))
    expect(res.status).toBe(401)
  })

  it("skips users who opted out of weekly reminders", async () => {
    planDb.findMany.mockResolvedValue([
      {
        weeklyCheckIns: [],
        user: {
          id: "user-1",
          email: "opted-out@example.com",
          name: "Opted Out",
          preferences: { emailPreferences: { weeklyReviewReminder: false } },
        },
      },
      {
        weeklyCheckIns: [],
        user: {
          id: "user-2",
          email: "enabled@example.com",
          name: "Enabled",
          preferences: {},
        },
      },
    ] as never)

    const res = await GET(cronRequest())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.usersNotified).toBe(1)
    expect(json.data.usersSkipped).toBe(1)
    expect(sendWeeklyReminderMock).toHaveBeenCalledTimes(1)
    expect(sendWeeklyReminderMock).toHaveBeenCalledWith(
      "enabled@example.com",
      "Enabled",
    )
  })
})
