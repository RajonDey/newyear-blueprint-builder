import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * POST /api/drifts/[driftId]/restore — undo an archive from the dashboard inbox.
 * Only archived drifts (resolvedAs === "archived") can be restored; promoted
 * drifts keep their audit trail intact.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ driftId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { driftId } = await params
  const drift = await db.drift.findFirst({
    where: { id: driftId, userId: session.user.id },
  })

  if (!drift) {
    return NextResponse.json({ error: "Drift not found" }, { status: 404 })
  }

  if (!drift.resolvedAt || drift.resolvedAs !== "archived") {
    return NextResponse.json(
      { error: "Only archived drifts can be restored" },
      { status: 400 },
    )
  }

  const restored = await db.drift.update({
    where: { id: driftId },
    data: {
      resolvedAt: null,
      resolvedAs: null,
      resolvedRef: null,
    },
  })

  return NextResponse.json({ data: restored })
}
