import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/cron/weekly-rhythm", () => ({
  runWeeklyRhythmCron: vi.fn(),
  verifyCronSecret: vi.fn(),
}))

import { runWeeklyRhythmCron, verifyCronSecret } from "@/lib/cron/weekly-rhythm"
import { GET } from "./route"

const runMock = vi.mocked(runWeeklyRhythmCron)
const verifyMock = vi.mocked(verifyCronSecret)

function cronRequest() {
  return new Request("http://localhost/api/cron/weekly-reminder", {
    headers: { authorization: "Bearer test-cron-secret" },
  })
}

describe("GET /api/cron/weekly-reminder", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyMock.mockReturnValue(true)
    runMock.mockResolvedValue({
      kind: "review",
      weekNumber: 20,
      year: 2026,
      usersNotified: 1,
      usersSkipped: 1,
      usersSkippedDedupe: 0,
      usersSkippedTimezone: 0,
      sent: ["enabled@example.com"],
      skipped: ["opted-out@example.com"],
    })
  })

  it("returns 401 without cron secret", async () => {
    verifyMock.mockReturnValue(false)
    const res = await GET(new Request("http://localhost/api/cron/weekly-reminder"))
    expect(res.status).toBe(401)
  })

  it("delegates to weekly review rhythm cron", async () => {
    const res = await GET(cronRequest())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data.kind).toBe("review")
    expect(json.data.usersNotified).toBe(1)
    expect(json.data.usersSkipped).toBe(1)
    expect(runMock).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "review" }),
    )
  })
})
