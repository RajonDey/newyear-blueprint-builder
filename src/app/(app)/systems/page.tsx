import type { Metadata } from "next"
import Link from "next/link"
import { Repeat } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getSystemsManagement } from "@/lib/queries/systems"
import { getProjectsForUser } from "@/lib/queries/projects"
import { planLimits } from "@/lib/config"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { SystemsManagement } from "@/components/systems/systems-management"

export const metadata: Metadata = { title: "Systems" }

export default async function SystemsPage() {
  const session = await requireAuth()
  const [data, { projects }] = await Promise.all([
    getSystemsManagement(session.user.id),
    getProjectsForUser(session.user.id),
  ])

  if (!data.hasActivePlan) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Planning · Systems"
          title="Quiet things that compound"
          description="The small set of practices you check off. Edit here; they show up on Today and in your weekly grid."
        />
        <EmptyState
          icon={Repeat}
          bordered
          title="Start with a yearly plan"
          description="Systems attach to projects, and projects attach to your active plan."
          action={
            <Button asChild>
              <Link href="/onboarding">Start onboarding</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const limits = planLimits[session.user.planTier]
  // `creatableProjects` are the ones with room for a new system (used by the
  // "Add system" row); `allProjects` is the full list (used by per-row
  // "Move to project…" pickers — the API enforces the cap on the target).
  const creatableProjects = projects
    .filter((p) => p.systems.length < limits.maxSystemsPerProject)
    .map((p) => ({ id: p.id, title: p.title }))
  const allProjects = projects.map((p) => ({ id: p.id, title: p.title }))

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Planning · Systems"
        title="Quiet things that compound"
        description="The small set of practices you check off. Edit here; they show up on Today and in your weekly grid."
        actions={
          <div className="text-xs text-muted-foreground">
            {data.active.length} active · {data.archived.length} archived
          </div>
        }
      />

      <SystemsManagement
        data={data}
        projectOptions={creatableProjects}
        allProjects={allProjects}
      />
    </PageContainer>
  )
}
