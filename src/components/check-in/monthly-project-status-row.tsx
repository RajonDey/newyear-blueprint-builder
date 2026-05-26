"use client"

import { useState } from "react"
import type { GoalStatus } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"
import { Loader2, Target } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectRow {
  id: string
  title: string
  category: string
  status: GoalStatus
}

const STATUS_OPTIONS: { value: GoalStatus; label: string }[] = [
  { value: "ON_TRACK", label: "On track" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "AT_RISK", label: "At risk" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "COMPLETED", label: "Completed" },
]

const STATUS_TONE: Partial<Record<GoalStatus, string>> = {
  ON_TRACK: "text-emerald-600 dark:text-emerald-400",
  AT_RISK: "text-red-600 dark:text-red-400",
  COMPLETED: "text-emerald-600 dark:text-emerald-400",
  IN_PROGRESS: "text-blue-600 dark:text-blue-400",
}

export function MonthlyProjectStatusRow({
  projects: initialProjects,
}: {
  projects: ProjectRow[]
}) {
  const [projects, setProjects] = useState(initialProjects)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function updateStatus(projectId: string, status: GoalStatus) {
    setUpdatingId(projectId)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error("Failed to update")
      setProjects((prev) =>
        prev.map((g) => (g.id === projectId ? { ...g, status } : g)),
      )
      toast.success("Project status updated")
    } catch {
      toast.error("Failed to update project status")
    } finally {
      setUpdatingId(null)
    }
  }

  if (projects.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Target className="h-4 w-4 text-accent" />
          Project health check
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Reset where each project stands before you close the month.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {projects.map((g) => {
          const cat = LIFE_CATEGORIES.find((c) => c.id === g.category)
          const isUpdating = updatingId === g.id
          return (
            <div
              key={g.id}
              className="flex flex-col gap-2 rounded-lg border px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-2">
                {cat && (
                  <cat.icon
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: cat.color }}
                  />
                )}
                <span className="text-sm font-medium truncate">{g.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isUpdating && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                <Select
                  value={g.status}
                  onValueChange={(v) => updateStatus(g.id, v as GoalStatus)}
                  disabled={isUpdating}
                >
                  <SelectTrigger
                    className={cn(
                      "h-8 w-[140px] text-xs",
                      STATUS_TONE[g.status],
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
