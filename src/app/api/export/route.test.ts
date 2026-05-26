import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/queries/user-export", () => ({
  buildUserExport: vi.fn(),
  ExportTooLargeError: class ExportTooLargeError extends Error {
    rowCount: number
    constructor(rowCount: number) {
      super("too large")
      this.rowCount = rowCount
    }
  },
}))

vi.mock("@/lib/rate-limit-export", () => ({
  rateLimitExportIfConfigured: vi.fn(),
}))

import { buildUserExport, ExportTooLargeError } from "@/lib/queries/user-export"
import { rateLimitExportIfConfigured } from "@/lib/rate-limit-export"
import { GET } from "./route"

const buildExportMock = vi.mocked(buildUserExport)
const rateLimitMock = vi.mocked(rateLimitExportIfConfigured)

describe("GET /api/export", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    rateLimitMock.mockResolvedValue(null)
    buildExportMock.mockResolvedValue({
      meta: {
        version: 1,
        exportedAt: "2026-05-21T12:00:00.000Z",
        app: "yearinreview",
        rowCount: 2,
      },
      user: { id: "user-test-1", email: "test@example.com" },
      areas: [],
    } as never)
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
    expect(buildExportMock).not.toHaveBeenCalled()
  })

  it("returns 429 when rate limited", async () => {
    rateLimitMock.mockResolvedValue(
      NextResponse.json({ error: "Too many" }, { status: 429 }),
    )
    const res = await GET()
    expect(res.status).toBe(429)
    expect(buildExportMock).not.toHaveBeenCalled()
  })

  it("returns downloadable JSON with attachment headers", async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(res.headers.get("Content-Type")).toContain("application/json")
    expect(res.headers.get("Content-Disposition")).toContain(
      'filename="yearinreview-export-2026-05-21.json"',
    )
    expect(buildExportMock).toHaveBeenCalledWith("user-test-1")
    const body = await res.text()
    expect(body).toContain('"app": "yearinreview"')
  })

  it("returns 413 when export is too large", async () => {
    buildExportMock.mockRejectedValue(new ExportTooLargeError(12_000))
    const res = await GET()
    expect(res.status).toBe(413)
    const json = await res.json()
    expect(json.rowCount).toBe(12_000)
  })
})
