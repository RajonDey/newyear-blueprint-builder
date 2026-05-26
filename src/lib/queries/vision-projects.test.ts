import { describe, expect, it, vi, beforeEach } from "vitest"

vi.mock("@/lib/db", () => ({
  db: {
    project: { findMany: vi.fn() },
    vision: { findUnique: vi.fn() },
    visionItem: { findFirst: vi.fn() },
  },
}))

import { db } from "@/lib/db"
import {
  getLinkedProjectsByVisionItemIds,
  getVisionMilestoneProjectSummary,
} from "@/lib/queries/vision-projects"

describe("getLinkedProjectsByVisionItemIds", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("groups active projects by vision item id", async () => {
    vi.mocked(db.project.findMany).mockResolvedValue([
      { id: "p-1", title: "Run a 5K", visionItemId: "vi-1" },
      { id: "p-2", title: "Train weekly", visionItemId: "vi-1" },
    ] as never)

    const map = await getLinkedProjectsByVisionItemIds("user-1", ["vi-1"])
    expect(map.get("vi-1")).toEqual([
      { id: "p-1", title: "Run a 5K" },
      { id: "p-2", title: "Train weekly" },
    ])
  })
})

describe("getVisionMilestoneProjectSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("counts distinct milestones with active linked projects", async () => {
    vi.mocked(db.project.findMany).mockResolvedValue([
      { visionItem: { id: "vi-1", kind: "MILESTONE" } },
      { visionItem: { id: "vi-1", kind: "MILESTONE" } },
      { visionItem: { id: "vi-2", kind: "VALUE" } },
    ] as never)

    await expect(getVisionMilestoneProjectSummary("user-1")).resolves.toEqual({
      linkedMilestoneCount: 1,
    })
  })
})
