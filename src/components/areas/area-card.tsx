import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { LifeCategory, GoalStatus } from "@prisma/client"
import { areaHue, areaIcon, levelStyles, lifeCategoryLabels } from "@/lib/level-styles"
import type { AreaHealth } from "@/lib/queries/area-health"
import { AreaHealthIndicator } from "@/components/areas/area-health-indicator"

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
  /**
   * Optional client-rendered action menu (Edit / Move / Delete). Positioned
   * absolutely above the link wrapper; the slot's internal handlers are
   * responsible for stopping click propagation so the underlying Link doesn't
   * navigate away on menu interactions.
   */
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
        className={`${levelStyles.area.container} group block p-5`}
        style={{ boxShadow: `inset 4px 0 0 hsl(${hue} / 0.6)` }}
      >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `hsl(${hue} / 0.12)`,
            color: `hsl(${hue})`,
          }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className={levelStyles.area.eyebrow}>Area</div>
        <AreaHealthIndicator health={health} />
      </div>
      <h2 className={`${levelStyles.area.title}`}>{name}</h2>
      {showCategoryHint && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {categoryLabel} domain
        </p>
      )}
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

      {topProjects.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {topProjects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
            >
              <span className="truncate">{p.title}</span>
              <span className="tabular-nums text-[10px] uppercase tracking-wider">
                {STATUS_LABEL[p.status]}
              </span>
            </li>
          ))}
          {moreProjects > 0 && (
            <li className="text-xs text-muted-foreground/60">
              + {moreProjects} more
            </li>
          )}
        </ul>
      )}
      </Link>
    </div>
  )
}
