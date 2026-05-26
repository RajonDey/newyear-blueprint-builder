import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react"
import { notFound } from "next/navigation"
import type { GoalStatus } from "@prisma/client"
import { requireAuth } from "@/lib/auth-guard"
import { getAreaById } from "@/lib/queries/areas"
import { getProjectsForUser } from "@/lib/queries/projects"
import { getNotesForParent } from "@/lib/queries/notes"
import { getResourcesForParent } from "@/lib/queries/resources"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { areaHue, areaIcon, lifeCategoryLabels } from "@/lib/level-styles"
import { PageContainer } from "@/components/shared/page-container"
import { NotesBlock } from "@/components/knowledge/notes-block"
import { ResourcesBlock } from "@/components/knowledge/resources-block"
import { knowledgeNotesHref, knowledgeResourcesHref } from "@/lib/knowledge/index-links"
import { ProUpsellCard } from "@/components/upgrade/pro-upsell-card"
import { ProjectQuickStart } from "@/components/projects/project-quick-start"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Area" }

const STATUS_LABEL: Record<GoalStatus, string> = {
  NOT_STARTED: "Planning",
  IN_PROGRESS: "Active",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  COMPLETED: "Done",
  ABANDONED: "Archived",
}

const STATUS_TONE: Partial<Record<GoalStatus, string>> = {
  ON_TRACK: "text-status-positive",
  AT_RISK: "text-status-attention",
  COMPLETED: "text-status-positive",
}

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ areaId: string }>
}) {
  const session = await requireAuth()
  const { areaId } = await params
  const decodedId = decodeURIComponent(areaId)
  const [result, notes, resources, { projects: planProjects, activePlanYear }] =
    await Promise.all([
      getAreaById(decodedId, session.user.id),
      getNotesForParent(session.user.id, "AREA", decodedId),
      getResourcesForParent(session.user.id, "AREA", decodedId),
      getProjectsForUser(session.user.id),
    ])
  if (!result) notFound()

  const { area, projects } = result
  const category = area.category
  const Icon = category ? areaIcon[category] : FileText
  const hue = category ? areaHue[category] : "35 70% 50%"
  const limits = planLimits[session.user.planTier]
  const isPro = hasProProductAccess(session.user.planTier, session.user.role)
  const hasPlan = activePlanYear != null
  const atCap = !isPro && planProjects.length >= limits.maxProjects

  return (
    <PageContainer>
      <section className="-mx-4 space-y-6 border-b border-border px-4 pb-8 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
            <Link href="/areas">
              <ArrowLeft className="h-4 w-4" /> Areas
            </Link>
          </Button>
        </div>

        <header className="flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `hsl(${hue} / 0.12)`,
              color: `hsl(${hue})`,
            }}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight">
              {area.name}
            </h1>
            {category &&
              area.name.trim().toLowerCase() !==
                lifeCategoryLabels[category].toLowerCase() && (
                <p className="text-sm text-muted-foreground mt-1">
                  {lifeCategoryLabels[category]} domain · same color family as
                  Wheel
                </p>
              )}
            {area.description && (
              <p className="text-muted-foreground mt-2 max-w-2xl leading-relaxed">
                {area.description}
              </p>
            )}
          </div>
        </header>
      </section>

      <section className="border border-border">
        <header className="border-b border-border px-4 py-3 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight">Projects</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {projects.length} total
            </span>
            {hasPlan && (
              <ProjectQuickStart
                variant="dialog"
                triggerLabel="Add project in this area"
                triggerSize="sm"
                defaultAreaId={area.id}
                defaultCategory={area.category}
                areaName={area.name}
                atCap={atCap}
                maxProjects={limits.maxProjects}
              />
            )}
          </div>
        </header>

        <div className="px-4 py-4">
          {atCap && (
            <div className="mb-4">
              <ProUpsellCard
                feature="more projects"
                title={`You're at the Free cap of ${limits.maxProjects} projects`}
                description="Upgrade to Pro to add more projects across your areas."
                bullets={[
                  "Up to 12 projects per yearly plan",
                  "Unlimited tasks per project",
                ]}
              />
            </div>
          )}

          {projects.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No projects in this area yet.
              </p>
              {hasPlan && !atCap && (
                <div className="mt-4 flex justify-center">
                  <ProjectQuickStart
                    variant="dialog"
                    triggerLabel="Add project in this area"
                    defaultAreaId={area.id}
                    defaultCategory={area.category}
                    areaName={area.name}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="border-y border-border divide-y divide-border">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group flex flex-col gap-2 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                  style={
                    category
                      ? {
                          borderLeftWidth: "3px",
                          borderLeftColor: `hsl(${hue} / 0.55)`,
                          paddingLeft: "0.75rem",
                          marginLeft: "-0.75rem",
                        }
                      : undefined
                  }
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {p.title}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>
                        {p.taskCount} {p.taskCount === 1 ? "task" : "tasks"}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>
                        {p.systemCount}{" "}
                        {p.systemCount === 1 ? "system" : "systems"}
                      </span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="tabular-nums">{p.progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:block h-1 w-24 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-amber"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        STATUS_TONE[p.status as GoalStatus] ??
                          "text-muted-foreground",
                      )}
                    >
                      {STATUS_LABEL[p.status as GoalStatus]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <NotesBlock
          parentType="AREA"
          parentId={area.id}
          initial={notes}
          description="Decisions, themes, and ideas that span this entire area."
          viewAllHref={knowledgeNotesHref({
            parentType: "AREA",
            areaId: area.id,
          })}
        />
        <ResourcesBlock
          parentType="AREA"
          parentId={area.id}
          initial={resources}
          canUploadFiles={limits.canUploadResourceFiles}
          maxFileBytes={limits.maxResourceFileBytes}
          description="Books, articles, and reference material for this area."
          viewAllHref={knowledgeResourcesHref({
            parentType: "AREA",
            areaId: area.id,
          })}
        />
      </div>
    </PageContainer>
  )
}
