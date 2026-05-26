import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { getDriftsForUser } from "@/lib/queries/drifts"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { DriftsBoard } from "@/components/drifts/drifts-board"

export const metadata: Metadata = {
  title: "Drift inbox",
  description: "Quick captures waiting to be organised.",
}

export default async function DriftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; focus?: string }>
}) {
  const session = await requireAuth()
  const params = await searchParams
  const search = params.q?.trim() || undefined
  const focusId = params.focus?.trim() || null

  const [data, projects, areas] = await Promise.all([
    getDriftsForUser(session.user.id, { search }),
    db.project.findMany({
      where: { plan: { userId: session.user.id, status: "ACTIVE" } },
      select: { id: true, title: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.area.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  const description =
    data.counts.total === 0
      ? "Press ⌘K anywhere to capture a thought. The dashboard shows your latest — this is the full inbox when you have time to process captures into tasks, notes, or archive."
      : `${data.counts.inbox} unprocessed · ${data.counts.resolved} resolved. The dashboard previews recent captures; triage everything here when you're ready.`

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Today · Drift inbox"
        title="Process your captures"
        description={description}
      />

      <DriftsBoard
        initialInbox={data.inbox}
        initialResolved={data.resolved}
        counts={data.counts}
        projects={projects}
        areas={areas}
        focusId={focusId}
      />
    </PageContainer>
  )
}
