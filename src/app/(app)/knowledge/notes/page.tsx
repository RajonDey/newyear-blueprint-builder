import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import {
  countNotesForUserFiltered,
  listNotesForUser,
  parseKnowledgeListFilters,
} from "@/lib/queries/knowledge-index"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { NotesIndexBoard } from "@/components/knowledge/notes-index-board"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Notes",
  description: "Browse all notes across your areas and projects.",
}

export default async function KnowledgeNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const session = await requireAuth()
  const params = await searchParams
  const filters = parseKnowledgeListFilters(params)

  const [page, total, areas] = await Promise.all([
    listNotesForUser(session.user.id, filters),
    countNotesForUserFiltered(session.user.id, filters),
    db.area.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Knowledge · Notes"
        title="All notes"
        description="Browse-only index — notes still live on their parent. Edit inline here or open the parent to see full context."
        actions={
          <Link
            href="/knowledge/resources"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View resources →
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-amber" />
          </div>
        }
      >
        <NotesIndexBoard
          key={`${filters.parentType ?? "all"}-${filters.areaId ?? "all"}`}
          initialItems={page.items}
          initialCursor={page.nextCursor}
          total={total}
          areas={areas}
          filters={{
            parentType: filters.parentType,
            areaId: filters.areaId,
          }}
        />
      </Suspense>
    </PageContainer>
  )
}
