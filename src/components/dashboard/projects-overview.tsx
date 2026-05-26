/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { getStatusStyle } from "@/lib/constants/status"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { WeeklyPriorityBadge } from "@/components/shared/weekly-priority-badge"
import { ArrowRight, Flame, Target } from "lucide-react"

interface ProjectSummary {
  id: string
  title: string
  category: string
  type: string
  status: string
  checkpoints: { id: string; status: string; quarter: string }[]
}

export function ProjectsOverview({
  projects,
  planYear,
  priorityProjectIds = [],
}: {
  projects: ProjectSummary[]
  /** Active plan year (dashboard only passes this when a plan exists) */
  planYear: number
  priorityProjectIds?: string[]
}) {
  const prioritySet = new Set(priorityProjectIds)
  if (projects.length === 0) {
    return (
      <section className="space-y-4">
        <header>
          <h3 className="font-display text-xl md:text-2xl tracking-tight">
            Projects
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nothing anchored yet
          </p>
        </header>
        <div className="flex gap-3 border border-dashed border-border bg-muted/30 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-tint text-amber">
            <Target className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Add intentions to your {planYear} plan so checkpoints, weekly
              rhythm, and daily systems have something to anchor to.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/projects">Add project</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full sm:w-auto">
            <Link href="/areas">View areas</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl md:text-2xl tracking-tight">
            Projects · {planYear}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            What you&apos;re moving on
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <ul className="space-y-2">
        {projects.map((project) => {
          const cat = LIFE_CATEGORIES.find((c) => c.id === project.category)
          const completedCPs = project.checkpoints.filter(
            (cp) => cp.status === "COMPLETED",
          ).length
          const totalCPs = project.checkpoints.length
          const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0
          const status = getStatusStyle(project.status)
          const isPriority = prioritySet.has(project.id)

          return (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className={cn(
                  "block rounded-xl border bg-background/50 p-4 transition-colors hover:bg-muted/40",
                  isPriority
                    ? "border-amber/35 ring-1 ring-amber/15"
                    : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      {cat && (
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: cat.color }}
                        />
                      )}
                      <span className="truncate text-sm font-medium">
                        {project.title}
                      </span>
                      {project.type === "PRIMARY" && (
                        <Flame
                          className="h-3 w-3 shrink-0 text-amber"
                          aria-label="Primary project"
                        />
                      )}
                      {isPriority && <WeeklyPriorityBadge />}
                    </div>
                    {totalCPs > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                          {completedCPs}/{totalCPs}
                        </span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={`shrink-0 text-[10px] ${status.className}`}
                  >
                    {status.label}
                  </Badge>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
