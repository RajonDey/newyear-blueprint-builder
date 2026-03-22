import Link from "next/link"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, ArrowRight, Calendar, Repeat } from "lucide-react"

interface GoalCardProps {
  goal: {
    id: string
    title: string
    description?: string | null
    category: string
    type: string
    status: string
    checkpointGoals: { id: string; status: string }[]
    dailySystems: { id: string; isActive: boolean }[]
    motivation: { whyText: string } | null
  }
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Not Started", className: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  ON_TRACK: { label: "On Track", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  AT_RISK: { label: "At Risk", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  ABANDONED: { label: "Abandoned", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

export function GoalCard({ goal }: GoalCardProps) {
  const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
  const status = STATUS_MAP[goal.status] || STATUS_MAP.NOT_STARTED
  const completedCPs = goal.checkpointGoals.filter((cp) => cp.status === "COMPLETED").length
  const totalCPs = goal.checkpointGoals.length
  const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0
  const activeSystems = goal.dailySystems.filter((s) => s.isActive).length

  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="relative overflow-hidden hover:shadow-md transition-shadow group">
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: catInfo?.color }}
        />
        <CardContent className="py-5 pl-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant="outline"
                  className="text-xs gap-1"
                  style={{ borderColor: catInfo?.color, color: catInfo?.color }}
                >
                  {catInfo && <catInfo.icon className="h-3 w-3" />}
                  {catInfo?.label}
                </Badge>
                {goal.type === "PRIMARY" && (
                  <Flame className="h-3.5 w-3.5 text-accent" />
                )}
              </div>

              <h3 className="font-medium text-base group-hover:text-accent transition-colors">
                {goal.title}
              </h3>

              {goal.description && (
                <div 
                  className="text-sm text-muted-foreground mt-1 line-clamp-2 prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: goal.description }}
                />
              )}

              {totalCPs > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Checkpoints
                    </span>
                    <span className="font-medium">
                      {completedCPs}/{totalCPs}
                    </span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                {activeSystems > 0 && (
                  <span className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" /> {activeSystems} systems
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="secondary" className={`text-xs ${status.className}`}>
                {status.label}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
