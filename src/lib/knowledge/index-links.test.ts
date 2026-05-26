import { describe, expect, it } from "vitest"
import {
  KNOWLEDGE_VIEW_ALL_THRESHOLD,
  knowledgeNotesHref,
  knowledgeResourcesHref,
} from "@/lib/knowledge/index-links"

describe("knowledge index links", () => {
  it("builds filtered notes href", () => {
    expect(
      knowledgeNotesHref({ parentType: "PROJECT", areaId: "area-1" }),
    ).toBe("/knowledge/notes?parentType=PROJECT&areaId=area-1")
  })

  it("builds unfiltered resources href", () => {
    expect(knowledgeResourcesHref()).toBe("/knowledge/resources")
  })

  it("uses preview threshold of 3", () => {
    expect(KNOWLEDGE_VIEW_ALL_THRESHOLD).toBe(3)
  })
})
