/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { ArrowUpRight, Flame } from "lucide-react"
import type { ReactNode } from "react"
import type { GoalStatus, LifeCategory } from "@prisma/client"
import { cn } from "@/lib/utils"
import { areaHue, areaIcon } from "@/lib/level-styles"
import { WeeklyPriorityBadge } from "@/components/shared/weekly-priority-badge"

interface ProjectCardProps {
  id: string
  title: string
  description: string | null
  category: LifeCategory
  type: "PRIMARY" | "SECONDARY"
  status: GoalStatus
  progress: number
  taskTotal: number
  taskDone: number
  checkpointTotal: number
  checkpointDone: number
  systemCount: number
  area: { id: string; name: string; color: string } | null
  actions?: ReactNode
  isWeeklyPriority?: boolean
}

const STATUS_LABEL: Record<GoalStatus, string> = {
  NOT_STARTED: "Planning",
  IN_PROGRESS: "Active",
  ON_TRACK: "On track",
  AT_RISK: "At risk",
  COMPLETED: "Done",
  ABANDONED: "Archived",
}

const STATUS_TONE: Record<GoalStatus, string> = {
  NOT_STARTED: "text-muted-foreground",
  IN_PROGRESS: "text-foreground",
  ON_TRACK: "text-status-positive",
  AT_RISK: "text-amber",
  COMPLETED: "text-status-positive",
  ABANDONED: "text-muted-foreground/60",
}

export function ProjectCard({
  id,
  title,
  description,
  category,
  type,
  status,
  progress,
  taskTotal,
  taskDone,
  checkpointTotal,
  checkpointDone,
  systemCount,
  area,
  actions,
  isWeeklyPriority = false,
}: ProjectCardProps) {
  const Icon = areaIcon[category]
  const hue = areaHue[category]
  const accent = `hsl(${hue})`

  return (
    <div className="relative">
      {actions}
      <Link
        href={`/projects/${id}`}
        className={cn(
          "group relative block border border-border bg-card p-5 transition-colors hover:bg-muted/30",
          status === "COMPLETED" && "opacity-80",
          isWeeklyPriority && "border-amber/35",
        )}
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: isWeeklyPriority
            ? "hsl(var(--amber) / 0.85)"
            : `hsl(${hue} / 0.65)`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              style={{ color: accent }}
            >
              <Icon className="h-3 w-3" />
              {area?.name ?? category[0] + category.slice(1).toLowerCase()}
            </div>
            <h3 className="font-display text-lg leading-snug tracking-tight mt-1">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isWeeklyPriority && <WeeklyPriorityBadge />}
            {type === "PRIMARY" && (
              <Flame className="h-3.5 w-3.5 text-amber" aria-label="Primary" />
            )}
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {description.replace(/<[^>]+>/g, "")}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-amber"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="tabular-nums w-9 text-right">{progress}%</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          {taskTotal > 0 && (
            <span>
              <span className="text-foreground font-medium">{taskDone}</span>/
              {taskTotal} tasks
            </span>
          )}
          {checkpointTotal > 0 && (
            <>
              {taskTotal > 0 && (
                <span className="text-muted-foreground/40">·</span>
              )}
              <span>
                <span className="text-foreground font-medium">
                  {checkpointDone}
                </span>
                /{checkpointTotal} checkpoints
              </span>
            </>
          )}
          {systemCount > 0 && (
            <>
              {(taskTotal > 0 || checkpointTotal > 0) && (
                <span className="text-muted-foreground/40">·</span>
              )}
              <span>
                {systemCount} {systemCount === 1 ? "system" : "systems"}
              </span>
            </>
          )}
          <span className="ml-auto inline-flex items-center gap-1">
            <span
              className={cn("h-1.5 w-1.5 rounded-full bg-current", STATUS_TONE[status])}
            />
            <span className={STATUS_TONE[status]}>{STATUS_LABEL[status]}</span>
          </span>
        </div>
      </Link>
    </div>
  )
}
