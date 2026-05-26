import type { Metadata } from "next"
import Link from "next/link"
import { CheckSquare } from "lucide-react"
import { requireAuth } from "@/lib/auth-guard"
import { getTasksForUser } from "@/lib/queries/tasks"
import { getWeeklyPriorityProjectIds } from "@/lib/queries/weekly-priorities"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { TasksBoard } from "@/components/tasks/tasks-board"
import { TasksHeaderActions } from "@/components/tasks/task-add-controls"
import { db } from "@/lib/db"

export const metadata: Metadata = { title: "Tasks" }

export default async function TasksPage() {
  const session = await requireAuth()
  const [data, priorityProjectIds] = await Promise.all([
    getTasksForUser(session.user.id),
    getWeeklyPriorityProjectIds(session.user.id),
  ])

  const projects = await db.project.findMany({
    where: { plan: { userId: session.user.id, status: "ACTIVE" } },
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      title: true,
      type: true,
      area: { select: { name: true } },
    },
  })

  const projectOptions = projects.map((p) => ({ id: p.id, title: p.title }))
  const taskProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    areaName: p.area?.name ?? null,
  }))
  const defaultProjectId =
    projects.find((p) => p.type === "PRIMARY")?.id ?? projects[0]?.id ?? null

  if (!data.hasActivePlan) {
    return (
      <PageContainer>
        <PageHeader
          eyebrow="Planning · Tasks"
          title="Concrete moves"
          description="Pull from your projects into Today and This Week. Anything undated waits in the backlog until you're ready."
        />
        <EmptyState
          icon={CheckSquare}
          bordered
          title="Start with a yearly plan"
          description="Tasks attach to projects, and projects attach to your active plan."
          action={
            <Button asChild>
              <Link href="/onboarding">Start onboarding</Link>
            </Button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Planning · Tasks"
        title="Concrete moves"
        description="Pull from your projects into Today and This Week. Anything undated waits in the backlog until you're ready."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TasksHeaderActions
              projects={taskProjects}
              defaultProjectId={defaultProjectId}
            />
            <span className="text-xs text-muted-foreground">
              {data.counts.total} task{data.counts.total !== 1 ? "s" : ""} across
              your projects
            </span>
          </div>
        }
      />

      <TasksBoard
        data={data}
        projects={taskProjects}
        defaultProjectId={defaultProjectId}
        projectOptions={projectOptions}
        priorityProjectIds={priorityProjectIds}
      />
    </PageContainer>
  )
}
