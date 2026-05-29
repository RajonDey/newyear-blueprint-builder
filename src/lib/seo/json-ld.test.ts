import { describe, expect, it } from "vitest"
import { MARKETING_FAQS } from "@/lib/marketing/faq-content"
import {
  buildArticleJsonLd,
  buildBlogIndexJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildSoftwareApplicationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/json-ld"

describe("seo json-ld builders", () => {
  it("builds WebSite schema", () => {
    const schema = buildWebSiteJsonLd()
    expect(schema["@type"]).toBe("WebSite")
    expect(schema.name).toBe("YearInReview")
  })

  it("builds SoftwareApplication schema with offers", () => {
    const schema = buildSoftwareApplicationJsonLd()
    expect(schema["@type"]).toBe("SoftwareApplication")
    expect(Array.isArray(schema.offers)).toBe(true)
  })

  it("builds FAQPage schema from marketing FAQs", () => {
    const schema = buildFaqPageJsonLd(MARKETING_FAQS)
    expect(schema["@type"]).toBe("FAQPage")
    expect(Array.isArray(schema.mainEntity)).toBe(true)
    expect((schema.mainEntity as unknown[]).length).toBe(MARKETING_FAQS.length)
  })

  it("builds Article schema with keywords and modified date", () => {
    const schema = buildArticleJsonLd({
      slug: "weekly-rhythm-over-guilt",
      title: "Weekly rhythm beats resolution guilt",
      description: "Long-term change needs a gentle weekly loop.",
      date: "2026-03-15",
      updated: "2026-05-01",
      keywords: ["weekly planning", "weekly rhythm"],
      pillar: "weekly-rhythm",
      readingMinutes: 5,
    })

    expect(schema["@type"]).toBe("Article")
    expect(schema.dateModified).toBe("2026-05-01")
    expect(schema.keywords).toBe("weekly planning, weekly rhythm")
    expect(schema.articleSection).toBe("weekly-rhythm")
  })

  it("builds Blog index schema with posts", () => {
    const schema = buildBlogIndexJsonLd([
      {
        slug: "systems-beat-resolutions",
        title: "Why resolutions fade—and systems don’t",
        description: "Annual planning fails when it stops at ambition.",
        date: "2026-03-18",
      },
    ])

    expect(schema["@type"]).toBe("Blog")
    expect(Array.isArray(schema.blogPost)).toBe(true)
  })

  it("builds breadcrumb schema", () => {
    const schema = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Wisdom", path: "/blog" },
    ])

    expect(schema["@type"]).toBe("BreadcrumbList")
    expect(Array.isArray(schema.itemListElement)).toBe(true)
  })
})
