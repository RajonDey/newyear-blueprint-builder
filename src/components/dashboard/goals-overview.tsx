import Link from "next/link"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { getStatusStyle } from "@/lib/constants/status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Flame, Target } from "lucide-react"

interface GoalSummary {
  id: string
  title: string
  category: string
  type: string
  status: string
  checkpointGoals: { id: string; status: string; quarter: string }[]
}

export function GoalsOverview({
  goals,
  planYear,
}: {
  goals: GoalSummary[]
  /** Active plan year (dashboard only passes this when a plan exists) */
  planYear: number
}) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Your Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-medium">No goals on this plan yet</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Add intentions to your {planYear} plan so checkpoints, weekly
                rhythm, and daily systems have something to anchor to.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href={`/plan/${planYear}#plan-goals`}>Add goal</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={`/plan/${planYear}`}>View full plan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display">Your Goals</CardTitle>
          <Link
            href="/goals"
            className="text-sm text-accent hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.map((goal) => {
          const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
          const completedCPs = goal.checkpointGoals.filter(
            (cp) => cp.status === "COMPLETED"
          ).length
          const totalCPs = goal.checkpointGoals.length
          const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0

          return (
            <Link
              key={goal.id}
              href={`/goals/${goal.id}`}
              className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {catInfo && (
                      <catInfo.icon
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: catInfo.color }}
                      />
                    )}
                    <span className="text-sm font-medium truncate">
                      {goal.title}
                    </span>
                    {goal.type === "PRIMARY" && (
                      <Flame className="h-3 w-3 text-accent shrink-0" />
                    )}
                  </div>
                  {totalCPs > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={progress} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground shrink-0">
                        {completedCPs}/{totalCPs}
                      </span>
                    </div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-xs ${getStatusStyle(goal.status).className}`}
                >
                  {getStatusStyle(goal.status).label}
                </Badge>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
