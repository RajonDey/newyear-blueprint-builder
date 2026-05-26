/* Hallmark · design-system: design.md · designed-as-app */

import { Badge } from "@/components/ui/badge"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { RhythmRecapLink } from "@/components/rhythm/rhythm-recap-link"
import {
  CalendarCheck,
  ClipboardCheck,
  Compass,
  Target,
} from "lucide-react"
import type { WeeklyConsistencyWeek } from "@/lib/queries/rhythm-stats"
import type { WeeklyCommitment } from "@/types/weekly"
import { WeeklyConsistencyChart } from "@/components/rhythm/weekly-consistency-chart"

interface Goal {
  id: string
  title: string
  category: string
}

interface WeeklyWorkspaceSidebarProps {
  weekNumber: number
  year: number
  isCurrentWeek: boolean
  suggestionFromLastWeek: string | null
  weeklyPlan: {
    priorityProjectIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
  existingCheckIn: {
    overallMood: number | null
    nextWeekFocus?: string | null
  } | null
  projects: Goal[]
  weeklyConsistency?: WeeklyConsistencyWeek[]
  weekConsistencyPct?: number
}

const MOOD_LABELS = ["", "Rough", "Tough", "Okay", "Good", "Great"]

export function WeeklyWorkspaceSidebar({
  weekNumber,
  year,
  isCurrentWeek,
  suggestionFromLastWeek,
  weeklyPlan,
  existingCheckIn,
  projects,
  weeklyConsistency,
  weekConsistencyPct,
}: WeeklyWorkspaceSidebarProps) {
  const hasPlan = weeklyPlan !== null
  const hasReview = existingCheckIn !== null
  const priorityGoals = (weeklyPlan?.priorityProjectIds ?? [])
    .map((id) => projects.find((g) => g.id === id))
    .filter(Boolean) as Goal[]

  const protectLabel = weeklyPlan?.protectCategory
    ? LIFE_CATEGORIES.find((c) => c.id === weeklyPlan.protectCategory)?.label ??
      weeklyPlan.protectCategory
    : null

  return (
    <>
      <section className="border border-border">
        <header className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            This week
          </h2>
        </header>
        <div className="px-4 py-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-lg tracking-tight">
              Week {weekNumber}, {year}
            </p>
            {isCurrentWeek && (
              <Badge variant="secondary" className="text-[10px]">
                Current
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="border border-border px-3 py-2">
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium mt-0.5 flex items-center gap-1">
                <CalendarCheck className="h-3 w-3" />
                {hasPlan ? "Saved" : "Not set"}
              </p>
            </div>
            <div className="border border-border px-3 py-2">
              <p className="text-muted-foreground">Review</p>
              <p className="font-medium mt-0.5 flex items-center gap-1">
                <ClipboardCheck className="h-3 w-3" />
                {hasReview ? "Done" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {suggestionFromLastWeek && (
        <section className="border border-accent/20 bg-accent/5">
          <header className="border-b border-accent/20 px-4 py-3">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-accent" />
              From last week
            </h2>
          </header>
          <div className="px-4 py-4">
            <div
              className="text-sm prose prose-sm dark:prose-invert max-w-none line-clamp-6"
              dangerouslySetInnerHTML={{
                __html: sanitizeRichTextHtml(suggestionFromLastWeek),
              }}
            />
          </div>
        </section>
      )}

      {hasPlan && (
        <section className="border border-border">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-accent" />
              Plan snapshot
            </h2>
          </header>
          <div className="px-4 py-4 space-y-3 text-sm">
            {priorityGoals.length > 0 ? (
              <ul className="space-y-1.5">
                {priorityGoals.map((g) => {
                  const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
                  return (
                    <li key={g.id} className="flex items-start gap-2">
                      {cat && (
                        <cat.icon
                          className="h-3.5 w-3.5 shrink-0 mt-0.5"
                          style={{ color: cat.color }}
                        />
                      )}
                      <span className="leading-snug">{g.title}</span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-muted-foreground text-xs">
                No priority projects selected yet.
              </p>
            )}
            {protectLabel && (
              <p className="text-xs text-muted-foreground">
                Protecting{" "}
                <span className="font-medium text-foreground">{protectLabel}</span>
              </p>
            )}
            {(weeklyPlan?.commitments.length ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                {weeklyPlan!.commitments.length} commitment
                {weeklyPlan!.commitments.length === 1 ? "" : "s"} logged
              </p>
            )}
          </div>
        </section>
      )}

      {hasReview && existingCheckIn?.overallMood && (
        <section className="border border-border">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Review mood</h2>
          </header>
          <div className="px-4 py-4">
            <Badge variant="secondary">
              {MOOD_LABELS[existingCheckIn.overallMood]} (
              {existingCheckIn.overallMood}/5)
            </Badge>
          </div>
        </section>
      )}

      {weeklyConsistency && weekConsistencyPct != null && (
        <WeeklyConsistencyChart
          weeks={weeklyConsistency}
          consistencyPct={weekConsistencyPct}
        />
      )}

      <RhythmRecapLink cadence="weekly" />
    </>
  )
}
