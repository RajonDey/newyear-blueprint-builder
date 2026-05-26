"use client"

import Link from "next/link"
import type { AntiGoal, LifeCategory } from "@prisma/client"
import { ProjectProgressTimeline } from "./project-progress-timeline"
import { ProjectKeyResults } from "./project-key-results"
import { ProjectDetailHeader } from "./project-detail-header"
import { ProjectVisionLink } from "./project-vision-link"
import { ProjectDetailCheckpoints } from "./project-detail-checkpoints"
import { ProjectDetailSystems } from "./project-detail-systems"
import { ProjectDetailMotivation } from "./project-detail-motivation"
import { ProjectDetailSection } from "./project-detail-section"
import { ProjectTasksBlock } from "./project-tasks-block"
import { AntiGoalsDisplay } from "@/components/anti-goals/anti-goals-display"
import { NotesBlock } from "@/components/knowledge/notes-block"
import { ResourcesBlock } from "@/components/knowledge/resources-block"
import { knowledgeNotesHref, knowledgeResourcesHref } from "@/lib/knowledge/index-links"
import type { NoteRow } from "@/lib/queries/notes"
import type { ResourceRow } from "@/lib/queries/resources"
import type { VisionItemPickerRow } from "@/lib/queries/vision-projects"
import type { ProjectDetail } from "@/types/project-detail"

interface ProjectDetailViewProps {
  project: ProjectDetail
  tasksCap: number
  notes: NoteRow[]
  resources: ResourceRow[]
  antiGoals: AntiGoal[]
  canUploadFiles: boolean
  maxFileBytes: number
  visionItems: VisionItemPickerRow[]
}

function filterAntiGoals(antiGoals: AntiGoal[], category?: LifeCategory | null) {
  if (!category) return antiGoals
  return antiGoals.filter((a) => a.category === category || a.category === null)
}

export function ProjectDetailView({
  project,
  tasksCap,
  notes,
  resources,
  antiGoals,
  canUploadFiles,
  maxFileBytes,
  visionItems,
}: ProjectDetailViewProps) {
  const checkIns = project.checkIns.map((ci) => ({
    id: ci.id,
    progressRating: ci.progressRating,
    notes: ci.notes,
    blockers: ci.blockers,
    weeklyCheckIn: {
      weekNumber: ci.weeklyCheckIn.weekNumber,
      year: ci.weeklyCheckIn.year,
      completedAt: ci.weeklyCheckIn.completedAt.toISOString(),
    },
  }))

  const filteredAntiGoals = filterAntiGoals(antiGoals, project.category)
  const keyResultCount = project.keyResults.length
  const checkpointCount = project.checkpoints.length

  return (
    <div className="space-y-8">
      <ProjectDetailHeader project={project} />

      <ProjectVisionLink
        projectId={project.id}
        currentVisionItem={project.visionItem}
        visionItems={visionItems}
      />

      <ProjectTasksBlock
        projectId={project.id}
        initialTasks={project.tasks}
        cap={tasksCap}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProjectDetailSystems projectId={project.id} systems={project.systems} />
        <ProjectDetailMotivation motivation={project.motivation} />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-1">
          More detail
        </p>

        <ProjectDetailSection
          title="Key results"
          count={keyResultCount}
          hint={keyResultCount === 0 ? "Add a measurable target" : undefined}
        >
          <ProjectKeyResults
            projectId={project.id}
            keyResults={project.keyResults}
            embedded
          />
        </ProjectDetailSection>

        <ProjectDetailSection title="Checkpoints" count={checkpointCount}>
          <ProjectDetailCheckpoints
            projectId={project.id}
            checkpoints={project.checkpoints}
            embedded
          />
          <ProjectProgressTimeline checkIns={checkIns} embedded />
        </ProjectDetailSection>

        <ProjectDetailSection
          title="Notes"
          count={notes.length}
          hint={notes.length === 0 ? "Capture decisions and context" : undefined}
        >
          <NotesBlock
            parentType="PROJECT"
            parentId={project.id}
            initial={notes}
            variant="flat"
            showHeader={false}
            description="Decisions, reflections, and ideas for this project."
            viewAllHref={knowledgeNotesHref({
              parentType: "PROJECT",
              areaId: project.area?.id,
            })}
          />
        </ProjectDetailSection>

        <ProjectDetailSection
          title="Resources"
          count={resources.length}
          hint={resources.length === 0 ? "Add links or reference files" : undefined}
        >
          <ResourcesBlock
            parentType="PROJECT"
            parentId={project.id}
            initial={resources}
            canUploadFiles={canUploadFiles}
            maxFileBytes={maxFileBytes}
            variant="flat"
            showHeader={false}
            description="Reference material, PDFs, and images that support the work."
            viewAllHref={knowledgeResourcesHref({
              parentType: "PROJECT",
              areaId: project.area?.id,
            })}
          />
        </ProjectDetailSection>

        <ProjectDetailSection
          title="Anti-goals context"
          count={filteredAntiGoals.length}
          hint={
            filteredAntiGoals.length === 0
              ? "Guardrails for this life area"
              : undefined
          }
        >
          {filteredAntiGoals.length > 0 ? (
            <AntiGoalsDisplay
              antiGoals={antiGoals}
              category={project.category}
              title="Anti-goals to honor here"
              variant="flat"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No guardrails match this project&apos;s life area yet.{" "}
              <Link href="/anti-goals" className="text-foreground hover:underline">
                Set anti-goals
              </Link>{" "}
              to keep your noes visible while you work.
            </p>
          )}
        </ProjectDetailSection>
      </div>
    </div>
  )
}
