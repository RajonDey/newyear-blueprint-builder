import Link from "next/link"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, Flame } from "lucide-react"

interface GoalSummary {
  id: string
  title: string
  category: string
  type: string
  status: string
  checkpointGoals: { id: string; status: string; quarter: string }[]
}

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ON_TRACK: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  AT_RISK: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ABANDONED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

function getStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function GoalsOverview({ goals }: { goals: GoalSummary[] }) {
  if (goals.length === 0) return null

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
                  className={`shrink-0 text-xs ${STATUS_COLORS[goal.status] || ""}`}
                >
                  {getStatusLabel(goal.status)}
                </Badge>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
