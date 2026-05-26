import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import {
  countResourcesForUserFiltered,
  listResourcesForUser,
  parseKnowledgeListFilters,
} from "@/lib/queries/knowledge-index"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { ResourcesIndexBoard } from "@/components/knowledge/resources-index-board"
import { Loader2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Resources",
  description: "Browse all links and files across your areas and projects.",
}

export default async function KnowledgeResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const session = await requireAuth()
  const params = await searchParams
  const filters = parseKnowledgeListFilters(params)

  const [page, total, areas] = await Promise.all([
    listResourcesForUser(session.user.id, filters),
    countResourcesForUserFiltered(session.user.id, filters),
    db.area.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Knowledge · Resources"
        title="All resources"
        description="Links and uploaded files attached to your work. Add new resources from area or project detail pages."
        actions={
          <Link
            href="/knowledge/notes"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View notes →
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
        <ResourcesIndexBoard
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
