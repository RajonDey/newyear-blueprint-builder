import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  listNotesForUser,
  parseKnowledgeListFilters,
} from "@/lib/queries/knowledge-index"

/**
 * GET /api/knowledge/notes?cursor=&limit=20&parentType=&areaId=
 *
 * Cursor-paginated notes index for "Load more" on `/knowledge/notes`.
 */
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const filters = parseKnowledgeListFilters(
    Object.fromEntries(searchParams.entries()),
  )

  const data = await listNotesForUser(session.user.id, filters)
  return NextResponse.json({ data })
}
