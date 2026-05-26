/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { LifeCategory, GoalStatus } from "@prisma/client"
import { areaHue, areaIcon, lifeCategoryLabels } from "@/lib/level-styles"
import type { AreaHealth } from "@/lib/queries/area-health"
import { AreaHealthIndicator } from "@/components/areas/area-health-indicator"
import { cn } from "@/lib/utils"

interface AreaCardProps {
  id: string
  name: string
  category: LifeCategory | null
  projectCount: number
  onTrackCount: number
  noteCount: number
  topProjects: { id: string; title: string; status: GoalStatus }[]
  moreProjects: number
  health: AreaHealth
  actions?: ReactNode
}

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

export function AreaCard({
  id,
  name,
  category,
  projectCount,
  onTrackCount,
  noteCount,
  topProjects,
  moreProjects,
  health,
  actions,
}: AreaCardProps) {
  const Icon: LucideIcon = category ? areaIcon[category] : ArrowUpRight
  const hue = category ? areaHue[category] : "35 70% 50%"
  const categoryLabel = category ? lifeCategoryLabels[category] : null
  const showCategoryHint =
    categoryLabel &&
    name.trim().toLowerCase() !== categoryLabel.toLowerCase()

  return (
    <div className="relative">
      {actions}
      <Link
        href={`/areas/${encodeURIComponent(id)}`}
        className="group flex h-[17.5rem] flex-col border border-border bg-card p-5 transition-colors hover:bg-muted/30"
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: `hsl(${hue} / 0.65)`,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `hsl(${hue} / 0.12)`,
              color: `hsl(${hue})`,
            }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-display text-xl tracking-tight min-w-0">{name}</h2>
          <AreaHealthIndicator health={health} />
        </div>
        <div className="min-h-[1.125rem]">
          {showCategoryHint && (
            <p className="text-xs text-muted-foreground">
              {categoryLabel} domain
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            <span className="text-foreground font-medium">{projectCount}</span>{" "}
            {projectCount === 1 ? "project" : "projects"}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{onTrackCount} active</span>
          {noteCount > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>
                {noteCount} {noteCount === 1 ? "note" : "notes"}
              </span>
            </>
          )}
        </div>

        <ul className="mt-4 min-h-[6.25rem] flex-1 space-y-1.5">
          {topProjects.length > 0 ? (
            <>
              {topProjects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
                >
                  <span className="truncate">{p.title}</span>
                  <span
                    className={cn(
                      "shrink-0 tabular-nums",
                      STATUS_TONE[p.status] ?? "text-muted-foreground",
                    )}
                  >
                    {STATUS_LABEL[p.status]}
                  </span>
                </li>
              ))}
              {moreProjects > 0 && (
                <li className="text-xs text-muted-foreground/60">
                  + {moreProjects} more
                </li>
              )}
            </>
          ) : (
            <li className="text-xs text-muted-foreground/60">No projects yet</li>
          )}
        </ul>
      </Link>
    </div>
  )
}
