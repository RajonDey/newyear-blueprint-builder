import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { getAreaById } from "@/lib/queries/areas"
import { getProjectsForUser } from "@/lib/queries/projects"
import { getNotesForParent } from "@/lib/queries/notes"
import { getResourcesForParent } from "@/lib/queries/resources"
import { planLimits } from "@/lib/config"
import { hasProProductAccess } from "@/lib/plan-access"
import { areaHue, areaIcon, levelStyles, lifeCategoryLabels } from "@/lib/level-styles"
import { PageContainer } from "@/components/shared/page-container"
import { NotesBlock } from "@/components/knowledge/notes-block"
import { ResourcesBlock } from "@/components/knowledge/resources-block"
import { knowledgeNotesHref, knowledgeResourcesHref } from "@/lib/knowledge/index-links"
import { ProUpsellCard } from "@/components/upgrade/pro-upsell-card"
import { ProjectQuickStart } from "@/components/projects/project-quick-start"

export const metadata: Metadata = { title: "Area" }

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
      <Link
        href="/areas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground -mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> All areas
      </Link>

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
        <div>
          <div className="text-[11px] font-semibold tracking-widest text-amber uppercase mb-1">
            Area · {activePlanYear ?? new Date().getFullYear()}
          </div>
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

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
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
        </div>

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
          <div className="rounded-2xl border border-dashed border-border/70 bg-card/50 p-8 text-center">
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
          <div className="grid gap-3 sm:grid-cols-2">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className={`${levelStyles.project.container} group block p-4`}
                style={
                  category
                    ? levelStyles.project.accent(category)
                    : undefined
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className={levelStyles.project.eyebrow}>Project</div>
                    <div
                      className={`${levelStyles.project.title} mt-1 truncate`}
                    >
                      {p.title}
                    </div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-amber"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{p.progress}%</span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground/80">
                  <span>
                    {p.taskCount} {p.taskCount === 1 ? "task" : "tasks"}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>
                    {p.systemCount}{" "}
                    {p.systemCount === 1 ? "system" : "systems"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
