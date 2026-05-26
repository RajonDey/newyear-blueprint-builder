import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Lightweight context fetch for the Quick Capture palette.
 *
 * Returns the user's areas, top projects, and most recent drifts so the
 * cmdk palette can render "Jump to" and "New task in [project]" groups
 * without each opening of ⌘K hitting the dashboard's heavier loaders.
 *
 * Designed to be cheap: small selects, hard-capped row counts. The
 * palette only opens on-demand so request volume is naturally bounded
 * by user keystrokes.
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const [areas, projects, recentDrifts] = await Promise.all([
    db.area.findMany({
      where: { userId },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
      take: 30,
    }),
    db.project.findMany({
      where: { plan: { userId, status: "ACTIVE" } },
      select: {
        id: true,
        title: true,
        category: true,
        areaId: true,
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      take: 25,
    }),
    db.drift.findMany({
      where: { userId, resolvedAt: null },
      select: { id: true, content: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ])

  return NextResponse.json({
    data: {
      areas,
      projects,
      recentDrifts,
    },
  })
}
