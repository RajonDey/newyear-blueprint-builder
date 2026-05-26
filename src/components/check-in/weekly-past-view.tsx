"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { Badge } from "@/components/ui/badge"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
import { ClipboardCheck, Target, Compass, FileText } from "lucide-react"
import type { WeeklyCommitment } from "@/types/weekly"

interface Goal {
  id: string
  title: string
  category: string
}

interface PastWeekData {
  projects: Goal[]
  weeklyPlan: {
    priorityProjectIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
  existingCheckIn: {
    overallMood: number | null
    notes: string | null
    nextWeekFocus?: string | null
    projectCheckIns: {
      projectId: string
      progressRating: number
      notes: string | null
      blockers: string | null
    }[]
  } | null
}

const MOOD_LABELS = ["", "Rough", "Tough", "Okay", "Good", "Great"]

export function WeeklyPastView({ data }: { data: PastWeekData }) {
  const hasPlan = data.weeklyPlan !== null
  const hasReview = data.existingCheckIn !== null

  if (!hasPlan && !hasReview) {
    return (
      <div className="border border-dashed border-border bg-muted/20 p-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nothing recorded this week</p>
        <p className="text-xs text-muted-foreground mt-1">
          No plan or review was saved for this week.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {hasPlan && (
        <section className="border border-border">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-base font-display flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Weekly plan
            </h2>
          </header>
          <div className="px-4 py-4 space-y-4">
            {data.weeklyPlan!.priorityProjectIds.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Priority projects
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.weeklyPlan!.priorityProjectIds.map((gid) => {
                    const goal = data.projects.find((g) => g.id === gid)
                    const cat = goal ? LIFE_CATEGORIES.find((c) => c.id === goal.category) : null
                    return (
                      <Badge key={gid} variant="outline" className="gap-1.5 py-1">
                        {cat && <cat.icon className="h-3 w-3" style={{ color: cat.color }} />}
                        {goal?.title ?? "Unknown project"}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {data.weeklyPlan!.protectCategory && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Protecting
                </p>
                <p className="text-sm">
                  {LIFE_CATEGORIES.find((c) => c.id === data.weeklyPlan!.protectCategory)?.label ?? data.weeklyPlan!.protectCategory}
                </p>
              </div>
            )}

            {data.weeklyPlan!.commitments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Commitments
                </p>
                <ul className="space-y-1">
                  {data.weeklyPlan!.commitments.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${c.kind === "core" ? "bg-accent" : "bg-muted-foreground/40"}`} />
                      <span className={c.kind === "follow_up" ? "text-muted-foreground" : ""}>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {hasReview && (
        <section className="border border-border">
          <header className="border-b border-border px-4 py-3">
            <h2 className="text-base font-display flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-accent" />
              Weekly review
            </h2>
          </header>
          <div className="px-4 py-4 space-y-4">
            {data.existingCheckIn!.overallMood && (
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium text-muted-foreground">Mood</p>
                <Badge variant="secondary">
                  {MOOD_LABELS[data.existingCheckIn!.overallMood]} ({data.existingCheckIn!.overallMood}/5)
                </Badge>
              </div>
            )}

            {data.existingCheckIn!.projectCheckIns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Project ratings
                </p>
                <div className="space-y-2">
                  {data.existingCheckIn!.projectCheckIns.map((gc) => {
                    const goal = data.projects.find((g) => g.id === gc.projectId)
                    const cat = goal ? LIFE_CATEGORIES.find((c) => c.id === goal.category) : null
                    return (
                      <div key={gc.projectId} className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          {cat && <cat.icon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />}
                          <span className="flex-1 truncate">{goal?.title ?? "Project"}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className={`h-2 w-4 rounded-sm ${n <= gc.progressRating ? "bg-accent" : "bg-muted"}`}
                              />
                            ))}
                          </div>
                        </div>
                        {gc.notes && (
                          <p className="text-xs text-muted-foreground ml-6">{gc.notes}</p>
                        )}
                        {gc.blockers && (
                          <p className="text-xs text-status-attention ml-6">
                            Blocker: {gc.blockers}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {data.existingCheckIn!.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <div
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(data.existingCheckIn!.notes) }}
                />
              </div>
            )}

            {data.existingCheckIn!.nextWeekFocus && (
              <div className="border border-accent/20 bg-accent/5 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                  <Compass className="h-3 w-3 text-accent" /> Looking ahead
                </p>
                <div
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(data.existingCheckIn!.nextWeekFocus) }}
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
