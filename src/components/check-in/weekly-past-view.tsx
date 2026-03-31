"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  goals: Goal[]
  weeklyPlan: {
    priorityGoalIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
  existingCheckIn: {
    overallMood: number | null
    notes: string | null
    nextWeekFocus?: string | null
    goalCheckIns: {
      goalId: string
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
      <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Weekly Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weeklyPlan!.priorityGoalIds.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Priority goals
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.weeklyPlan!.priorityGoalIds.map((gid) => {
                    const goal = data.goals.find((g) => g.id === gid)
                    const cat = goal ? LIFE_CATEGORIES.find((c) => c.id === goal.category) : null
                    return (
                      <Badge key={gid} variant="outline" className="gap-1.5 py-1">
                        {cat && <cat.icon className="h-3 w-3" style={{ color: cat.color }} />}
                        {goal?.title ?? "Unknown goal"}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {data.weeklyPlan!.protectCategory && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Protecting
                </p>
                <p className="text-sm">
                  {LIFE_CATEGORIES.find((c) => c.id === data.weeklyPlan!.protectCategory)?.label ?? data.weeklyPlan!.protectCategory}
                </p>
              </div>
            )}

            {data.weeklyPlan!.commitments.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
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
          </CardContent>
        </Card>
      )}

      {hasReview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-accent" />
              Weekly Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.existingCheckIn!.overallMood && (
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Mood</p>
                <Badge variant="secondary">
                  {MOOD_LABELS[data.existingCheckIn!.overallMood]} ({data.existingCheckIn!.overallMood}/5)
                </Badge>
              </div>
            )}

            {data.existingCheckIn!.goalCheckIns.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Goal ratings
                </p>
                <div className="space-y-2">
                  {data.existingCheckIn!.goalCheckIns.map((gc) => {
                    const goal = data.goals.find((g) => g.id === gc.goalId)
                    const cat = goal ? LIFE_CATEGORIES.find((c) => c.id === goal.category) : null
                    return (
                      <div key={gc.goalId} className="space-y-1">
                        <div className="flex items-center gap-3 text-sm">
                          {cat && <cat.icon className="h-3.5 w-3.5 shrink-0" style={{ color: cat.color }} />}
                          <span className="flex-1 truncate">{goal?.title ?? "Goal"}</span>
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
                          <p className="text-xs text-amber-600 dark:text-amber-400 ml-6">
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
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                <div
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(data.existingCheckIn!.notes) }}
                />
              </div>
            )}

            {data.existingCheckIn!.nextWeekFocus && (
              <div className="rounded-lg bg-accent/5 border border-accent/20 p-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Compass className="h-3 w-3 text-accent" /> Looking ahead
                </p>
                <div
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(data.existingCheckIn!.nextWeekFocus) }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
