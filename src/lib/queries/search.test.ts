import { describe, expect, it } from "vitest"
import { buildSearchSnippet } from "@/lib/queries/search"

describe("buildSearchSnippet", () => {
  it("collapses whitespace and truncates long text", () => {
    const long = "sleep   well\n tonight".padEnd(200, "!")
    const snippet = buildSearchSnippet(long, 40)
    expect(snippet.startsWith("sleep well tonight")).toBe(true)
    expect(snippet.endsWith("…")).toBe(true)
    expect(snippet.length).toBeLessThanOrEqual(40)
  })

  it("returns short text unchanged", () => {
    expect(buildSearchSnippet("  sleep habits  ")).toBe("sleep habits")
  })
})
