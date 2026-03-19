"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import {
  Flame,
  Calendar,
  Repeat,
  Heart,
  AlertTriangle,
  Check,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface GoalDetailProps {
  goal: {
    id: string
    title: string
    description?: string | null
    category: string
    type: string
    status: string
    plan: { id: string; year: number }
    checkpointGoals: {
      id: string
      quarter: string
      title: string
      description?: string | null
      status: string
    }[]
    dailySystems: {
      id: string
      description: string
      frequency: string
      isActive: boolean
    }[]
    habits: { id: string; description: string; routineFormula?: string | null; frequency: string }[]
    motivation: { whyText: string; consequenceText: string } | null
    actions: { id: string; type: string; description: string; status: string }[]
  }
}

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started", icon: Clock },
  { value: "IN_PROGRESS", label: "In Progress", icon: Loader2 },
  { value: "ON_TRACK", label: "On Track", icon: Check },
  { value: "AT_RISK", label: "At Risk", icon: AlertTriangle },
  { value: "COMPLETED", label: "Completed", icon: Check },
]

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
}

export function GoalDetailView({ goal }: GoalDetailProps) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const catInfo = LIFE_CATEGORIES.find((c) => c.id === goal.category)

  const completedCPs = goal.checkpointGoals.filter(
    (cp) => cp.status === "COMPLETED"
  ).length
  const totalCPs = goal.checkpointGoals.length
  const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0

  async function updateStatus(status: string) {
    setUpdating(true)
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      toast.success(`Status updated to ${status.replace(/_/g, " ")}`)
      router.refresh()
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="gap-1"
            style={{ borderColor: catInfo?.color, color: catInfo?.color }}
          >
            {catInfo && <catInfo.icon className="h-3 w-3" />}
            {catInfo?.label}
          </Badge>
          {goal.type === "PRIMARY" && (
            <Badge variant="secondary" className="gap-1 text-accent">
              <Flame className="h-3 w-3" /> Primary
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {goal.plan.year}
          </Badge>
        </div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          {goal.title}
        </h1>
        {goal.description && (
          <p className="text-muted-foreground mt-1">{goal.description}</p>
        )}
      </div>

      {/* Status Selector */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium mb-3">Status</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={goal.status === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateStatus(opt.value)}
                disabled={updating || goal.status === opt.value}
                className="gap-1.5"
              >
                <opt.icon className="h-3.5 w-3.5" />
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Checkpoints */}
      {totalCPs > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Quarterly
                Checkpoints
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {completedCPs}/{totalCPs} done
              </span>
            </div>
            <Progress value={progress} className="h-2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {goal.checkpointGoals.map((cp) => (
              <div
                key={cp.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                    cp.status === "COMPLETED"
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-muted-foreground/30"
                  }`}
                >
                  {cp.status === "COMPLETED" && (
                    <Check className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-accent">
                      {cp.quarter}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {QUARTER_LABELS[cp.quarter]}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{cp.title}</p>
                  {cp.description && (
                    <p className="text-xs text-muted-foreground">
                      {cp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily Systems */}
      {goal.dailySystems.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Repeat className="h-4 w-4 text-accent" /> Daily &amp; Weekly
              Systems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goal.dailySystems.map((sys) => (
              <div
                key={sys.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm">{sys.description}</span>
                <Badge variant="outline" className="text-xs">
                  {sys.frequency}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Motivation */}
      {goal.motivation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Heart className="h-4 w-4 text-accent" /> Your Why
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goal.motivation.whyText && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Why this matters
                </p>
                <p className="text-sm">{goal.motivation.whyText}</p>
              </div>
            )}
            <OrnamentDivider variant="dot" />
            {goal.motivation.consequenceText && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  What&apos;s at stake
                </p>
                <p className="text-sm">{goal.motivation.consequenceText}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
