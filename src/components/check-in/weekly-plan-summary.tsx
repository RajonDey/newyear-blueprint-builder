import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Target } from "lucide-react"
import type { WeeklyCommitment } from "@/types/weekly"

interface Goal {
  id: string
  title: string
  category: string
}

interface WeeklyPlanSummaryProps {
  projects: Goal[]
  weeklyPlan: {
    priorityProjectIds: string[]
    protectCategory: string | null
    commitments: WeeklyCommitment[]
  } | null
}

/** Read-only snapshot of the saved weekly plan — shown during review. */
export function WeeklyPlanSummary({ projects, weeklyPlan }: WeeklyPlanSummaryProps) {
  if (!weeklyPlan) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          No weekly plan saved yet. Switch to the Plan tab to set priorities before
          you review.
        </CardContent>
      </Card>
    )
  }

  const priorityGoals = weeklyPlan.priorityProjectIds
    .map((id) => projects.find((g) => g.id === id))
    .filter(Boolean) as Goal[]

  const protectLabel = weeklyPlan.protectCategory
    ? LIFE_CATEGORIES.find((c) => c.id === weeklyPlan.protectCategory)?.label ??
      weeklyPlan.protectCategory
    : null

  const hasContent =
    priorityGoals.length > 0 ||
    protectLabel ||
    weeklyPlan.commitments.length > 0

  if (!hasContent) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-4 text-sm text-muted-foreground">
          Your plan tab is open but empty — add priorities or commitments before
          closing the week.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-accent/20 bg-accent/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          Your plan this week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {priorityGoals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Priority projects
            </p>
            <div className="flex flex-wrap gap-2">
              {priorityGoals.map((g) => {
                const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
                return (
                  <Badge key={g.id} variant="outline" className="gap-1.5 py-1">
                    {cat && (
                      <cat.icon className="h-3 w-3" style={{ color: cat.color }} />
                    )}
                    {g.title}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {protectLabel && (
          <p className="text-sm text-muted-foreground">
            Protecting{" "}
            <span className="font-medium text-foreground">{protectLabel}</span>
          </p>
        )}

        {weeklyPlan.commitments.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Commitments
            </p>
            <ul className="space-y-1">
              {weeklyPlan.commitments.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      c.kind === "core" ? "bg-accent" : "bg-muted-foreground/40"
                    }`}
                  />
                  <span
                    className={c.kind === "follow_up" ? "text-muted-foreground" : ""}
                  >
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
