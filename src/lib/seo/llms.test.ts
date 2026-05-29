import { describe, expect, it } from "vitest"
import { buildLlmsTxt } from "@/lib/seo/llms"

describe("llms.txt builder", () => {
  it("includes product name, pages, and blog posts", () => {
    const text = buildLlmsTxt()

    expect(text).toContain("# YearInReview")
    expect(text).toContain("http://")
    expect(text).toContain("/blog")
    expect(text).toContain("/pricing")
    expect(text).toContain("Common questions")
  })
})
