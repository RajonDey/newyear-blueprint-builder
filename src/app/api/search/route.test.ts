import { NextResponse } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { authMock, mockSession } from "@/test/setup"

vi.mock("@/lib/queries/search", () => ({
  searchUserContent: vi.fn(),
}))

vi.mock("@/lib/rate-limit-search", () => ({
  rateLimitSearchIfConfigured: vi.fn(),
}))

import { searchUserContent } from "@/lib/queries/search"
import { rateLimitSearchIfConfigured } from "@/lib/rate-limit-search"
import { GET } from "./route"

const searchMock = vi.mocked(searchUserContent)
const rateLimitMock = vi.mocked(rateLimitSearchIfConfigured)

function getSearch(url: string) {
  return GET(new Request(url))
}

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue(mockSession())
    rateLimitMock.mockResolvedValue(null)
    searchMock.mockResolvedValue({ query: "sleep", groups: [] })
  })

  it("returns 401 when unauthenticated", async () => {
    authMock.mockResolvedValue(null)
    const res = await getSearch("http://localhost/api/search?q=sleep")
    expect(res.status).toBe(401)
    expect(searchMock).not.toHaveBeenCalled()
  })

  it("returns 429 when rate limited", async () => {
    rateLimitMock.mockResolvedValue(
      NextResponse.json({ error: "Too many" }, { status: 429 }),
    )
    const res = await getSearch("http://localhost/api/search?q=sleep")
    expect(res.status).toBe(429)
    expect(searchMock).not.toHaveBeenCalled()
  })

  it("searches with query and default limit", async () => {
    const res = await getSearch("http://localhost/api/search?q=sleep")
    expect(res.status).toBe(200)
    expect(searchMock).toHaveBeenCalledWith("user-test-1", "sleep", 20)
    const json = await res.json()
    expect(json.data.query).toBe("sleep")
  })

  it("caps limit at parser level via search helper", async () => {
    await getSearch("http://localhost/api/search?q=habit&limit=99")
    expect(searchMock).toHaveBeenCalledWith("user-test-1", "habit", 99)
  })
})
