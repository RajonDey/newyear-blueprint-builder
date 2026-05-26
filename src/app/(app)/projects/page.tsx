import type { Metadata } from "next"
import Link from "next/link"
import { Target } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getProjectsForUser } from "@/lib/queries/projects"
import { getWeeklyPriorityProjectIds } from "@/lib/queries/weekly-priorities"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { Button } from "@/components/ui/button"
import { ProUpsellCard } from "@/components/upgrade/pro-upsell-card"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectActions } from "@/components/projects/project-actions"
import { ProjectQuickStart } from "@/components/projects/project-quick-start"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsPage() {
  const session = await requireAuth()
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  const limits = planLimits[session.user.planTier]
  const [{ projects, activePlanYear }, priorityProjectIds] = await Promise.all([
    getProjectsForUser(session.user.id),
    getWeeklyPriorityProjectIds(session.user.id),
  ])
  const prioritySet = new Set(priorityProjectIds)
  const hasPlan = activePlanYear != null
  const atCap = !isPro && projects.length >= limits.maxProjects

  if (projects.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Your projects"
          description={
            hasPlan
              ? "Add a project to start tracking concrete outcomes across the year."
              : "Projects live inside your active yearly plan. Start one to begin."
          }
        />

        <EmptyState
          icon={Target}
          bordered
          title={hasPlan ? "No projects yet" : "Start with a plan"}
          description={
            hasPlan
              ? "A project is one specific outcome you're moving toward — ship X, train for Y, build Z. Each one anchors to a Life Area."
              : "You'll define your areas, projects, and one starting system in the onboarding wizard. Takes about a minute."
          }
          action={
            hasPlan ? null : (
              <Button asChild>
                <Link href="/onboarding">Start onboarding</Link>
              </Button>
            )
          }
        />

        {hasPlan && (
          <>
            <OrnamentDivider variant="dot" />
            <div className="max-w-xl mx-auto space-y-3">
              <ProjectQuickStart
                atCap={atCap}
                maxProjects={limits.maxProjects}
              />
            </div>
          </>
        )}
      </PageContainer>
    )
  }

  const primary = projects.filter((p) => p.type === "PRIMARY")
  const secondary = projects.filter((p) => p.type === "SECONDARY")
  const orderedIds = [...primary, ...secondary].map((p) => p.id)
  const primaryIds = primary.map((p) => p.id)
  const secondaryIds = secondary.map((p) => p.id)

  return (
    <PageContainer>
      <PageHeader
        title="Your projects"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""} in ${activePlanYear}. Areas → Projects → Tasks. Keep them few, keep them honest.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {hasPlan && (
              <ProjectQuickStart
                variant="dialog"
                atCap={atCap}
                maxProjects={limits.maxProjects}
              />
            )}
            <span className="text-xs text-muted-foreground">
              {projects.length} / {limits.maxProjects} on this plan
            </span>
          </div>
        }
      />

      {primary.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg tracking-tight text-foreground">
            Primary
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {primary.map((p) => (
              <ProjectCardWithCounts
                key={p.id}
                project={p}
                orderedIds={orderedIds}
                bucketIds={primaryIds}
                isWeeklyPriority={prioritySet.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {secondary.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg tracking-tight text-foreground">
            Secondary
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {secondary.map((p) => (
              <ProjectCardWithCounts
                key={p.id}
                project={p}
                orderedIds={orderedIds}
                bucketIds={secondaryIds}
                isWeeklyPriority={prioritySet.has(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {atCap && (
        <ProUpsellCard
          feature="more projects"
          title={`You're at the Free cap of ${limits.maxProjects} projects`}
          description="Upgrade to Pro for more projects per plan, unlimited tasks per project, and the full rhythm stack."
          bullets={[
            "Up to 12 projects per yearly plan",
            "Unlimited tasks per project",
            "Monthly & quarterly reviews",
          ]}
        />
      )}
    </PageContainer>
  )
}

type ProjectWithRels = Awaited<
  ReturnType<typeof getProjectsForUser>
>["projects"][number]

function ProjectCardWithCounts({
  project,
  orderedIds,
  bucketIds,
  isWeeklyPriority = false,
}: {
  project: ProjectWithRels
  orderedIds: string[]
  bucketIds: string[]
  isWeeklyPriority?: boolean
}) {
  const taskTotal = project._count.tasks
  const taskDone = project.tasks.filter((t) => t.status === "COMPLETED").length
  const checkpointTotal = project.checkpoints.length
  const checkpointDone = project.checkpoints.filter(
    (c) => c.status === "COMPLETED",
  ).length
  const totalUnits = taskTotal + checkpointTotal
  const doneUnits = taskDone + checkpointDone
  const progress = totalUnits > 0 ? Math.round((doneUnits / totalUnits) * 100) : 0
  const systemCount = project.systems.filter((s) => s.isActive).length

  return (
    <ProjectCard
      id={project.id}
      title={project.title}
      description={project.description}
      category={project.category}
      type={project.type}
      status={project.status}
      progress={progress}
      taskTotal={taskTotal}
      taskDone={taskDone}
      checkpointTotal={checkpointTotal}
      checkpointDone={checkpointDone}
      systemCount={systemCount}
      area={project.area}
      isWeeklyPriority={isWeeklyPriority}
      actions={
        <ProjectActions
          projectId={project.id}
          orderedIds={orderedIds}
          bucketIds={bucketIds}
        />
      }
    />
  )
}
