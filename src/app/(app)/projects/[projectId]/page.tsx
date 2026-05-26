import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { requireAuth } from "@/lib/auth-guard"
import { PageContainer } from "@/components/shared/page-container"
import { getProjectById } from "@/lib/queries/projects"
import { getNotesForParent } from "@/lib/queries/notes"
import { getResourcesForParent } from "@/lib/queries/resources"
import { getVisionItemsForPicker } from "@/lib/queries/vision-projects"
import { db } from "@/lib/db"
import { planLimits } from "@/lib/config"
import { ProjectDetailView } from "@/components/projects/project-detail-view"
import { ProjectAreaBreadcrumb } from "@/components/projects/project-area-breadcrumb"
import { MoveProjectMenu } from "@/components/projects/move-project-menu"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>
}): Promise<Metadata> {
  const session = await auth()
  if (!session?.user?.id) return { title: "Project" }
  const { projectId } = await params
  const project = await getProjectById(projectId, session.user.id)
  if (!project) return { title: "Project" }
  return { title: project.title }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const session = await requireAuth()
  const { projectId } = await params
  const project = await getProjectById(projectId, session.user.id)
  if (!project) notFound()

  const limits = planLimits[session.user.planTier]
  const [notes, resources, antiGoals, userAreas, visionItems] = await Promise.all([
    getNotesForParent(session.user.id, "PROJECT", project.id),
    getResourcesForParent(session.user.id, "PROJECT", project.id),
    db.antiGoal.findMany({
      where: { plan: { id: project.plan.id } },
      orderBy: { description: "asc" },
    }),
    db.area.findMany({
      where: { userId: session.user.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true },
    }),
    getVisionItemsForPicker(session.user.id),
  ])

  return (
    <PageContainer width="wide" spacing="default">
      <div className="flex items-center justify-between gap-3">
        <ProjectAreaBreadcrumb
          category={project.category}
          area={project.area}
        />
        <MoveProjectMenu
          projectId={project.id}
          currentAreaId={project.area?.id ?? null}
          areas={userAreas}
        />
      </div>

      <ProjectDetailView
        project={project}
        tasksCap={limits.maxTasksPerProject}
        notes={notes}
        resources={resources}
        antiGoals={antiGoals}
        canUploadFiles={limits.canUploadResourceFiles}
        maxFileBytes={limits.maxResourceFileBytes}
        visionItems={visionItems}
      />
    </PageContainer>
  )
}
