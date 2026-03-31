import Link from "next/link"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { getStatusStyle } from "@/lib/constants/status"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { sanitizeRichTextHtml } from "@/lib/sanitize-client"
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

export function GoalCard({ goal }: GoalCardProps) {
  const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)
  const status = getStatusStyle(goal.status)
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
                  dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(goal.description) }}
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
              <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
