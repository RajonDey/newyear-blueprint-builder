"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api-fetch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Check, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { QUARTER_LABELS } from "./project-detail-constants"
import type { ProjectDetail } from "@/types/project-detail"

export function ProjectDetailCheckpoints({
  projectId,
  checkpoints,
  embedded = false,
}: {
  projectId: string
  checkpoints: ProjectDetail["checkpoints"]
  embedded?: boolean
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState(false)
  const [cpAddOpen, setCpAddOpen] = useState(false)
  const [cpDraftQuarter, setCpDraftQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1")
  const [cpDraftTitle, setCpDraftTitle] = useState("")
  const [cpDraftDescription, setCpDraftDescription] = useState("")
  const [cpSubmitting, setCpSubmitting] = useState(false)

  const completedCPs = checkpoints.filter((cp) => cp.status === "COMPLETED").length
  const totalCPs = checkpoints.length
  const progress = totalCPs > 0 ? (completedCPs / totalCPs) * 100 : 0

  async function toggleCheckpoint(cp: ProjectDetail["checkpoints"][number]) {
    const next = cp.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"
    setUpdating(true)
    const result = await apiFetch(`/api/checkpoints/${cp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
      errorMessage: "Failed to update checkpoint",
    })
    setUpdating(false)
    if (!result.ok) return
    router.refresh()
  }

  async function addCheckpoint() {
    if (!cpDraftTitle.trim()) {
      toast.error("Give the checkpoint a short title.")
      return
    }
    setCpSubmitting(true)
    const result = await apiFetch(`/api/projects/${projectId}/checkpoints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quarter: cpDraftQuarter,
        title: cpDraftTitle.trim(),
        description: cpDraftDescription.trim() || undefined,
      }),
      errorMessage: "Could not add checkpoint.",
    })
    setCpSubmitting(false)
    if (!result.ok) return
    toast.success("Checkpoint added")
    setCpDraftTitle("")
    setCpDraftDescription("")
    setCpAddOpen(false)
    router.refresh()
  }

  async function deleteCheckpoint(cp: ProjectDetail["checkpoints"][number]) {
    if (!confirm(`Delete the ${cp.quarter} checkpoint "${cp.title}"?`)) return
    setUpdating(true)
    const result = await apiFetch(`/api/checkpoints/${cp.id}`, {
      method: "DELETE",
      errorMessage: "Could not delete checkpoint.",
    })
    setUpdating(false)
    if (!result.ok) return
    toast.success("Checkpoint removed")
    router.refresh()
  }

  const body = (
    <>
      {!embedded && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" /> Quarterly Checkpoints
            </CardTitle>
            <div className="flex items-center gap-3">
              {totalCPs > 0 && (
                <span className="text-sm text-muted-foreground">
                  {completedCPs}/{totalCPs} done
                </span>
              )}
              {!cpAddOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => setCpAddOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              )}
            </div>
          </div>
          {totalCPs > 0 && <Progress value={progress} className="h-2 mt-2" />}
        </CardHeader>
      )}
      {embedded && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          {totalCPs > 0 ? (
            <span className="text-sm text-muted-foreground">
              {completedCPs}/{totalCPs} done
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Quarterly milestones</span>
          )}
          {!cpAddOpen && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setCpAddOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          )}
        </div>
      )}
      {embedded && totalCPs > 0 && <Progress value={progress} className="h-2 mb-4" />}
      <CardContent className={embedded ? "space-y-3 p-0" : "space-y-3"}>
        {cpAddOpen && (
          <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/20 p-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={cpDraftQuarter}
                onValueChange={(v) =>
                  setCpDraftQuarter(v as "Q1" | "Q2" | "Q3" | "Q4")
                }
              >
                <SelectTrigger className="sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
                    <SelectItem key={q} value={q}>
                      {q} · {QUARTER_LABELS[q]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                autoFocus
                value={cpDraftTitle}
                onChange={(e) => setCpDraftTitle(e.target.value)}
                placeholder="Milestone title"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    addCheckpoint()
                  }
                }}
              />
            </div>
            <Textarea
              value={cpDraftDescription}
              onChange={(e) => setCpDraftDescription(e.target.value)}
              placeholder="Optional detail — what does done look like?"
              rows={2}
              className="resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCpAddOpen(false)
                  setCpDraftTitle("")
                  setCpDraftDescription("")
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={addCheckpoint}
                disabled={!cpDraftTitle.trim() || cpSubmitting}
              >
                {cpSubmitting ? (
                  <>
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Adding…
                  </>
                ) : (
                  "Add checkpoint"
                )}
              </Button>
            </div>
          </div>
        )}

        {totalCPs === 0 && !cpAddOpen ? (
          <p className="text-sm text-muted-foreground italic">
            No checkpoints yet. Add one per quarter to break the year into honest
            milestones.
          </p>
        ) : (
          checkpoints.map((cp) => (
            <div
              key={cp.id}
              className="group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <button
                type="button"
                onClick={() => toggleCheckpoint(cp)}
                disabled={updating}
                aria-label="Toggle checkpoint"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  cp.status === "COMPLETED"
                    ? "bg-emerald-500 text-white"
                    : "border-2 border-muted-foreground/30"
                }`}
              >
                {cp.status === "COMPLETED" && <Check className="h-3 w-3" />}
              </button>
              <button
                type="button"
                onClick={() => toggleCheckpoint(cp)}
                disabled={updating}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-accent">{cp.quarter}</span>
                  <span className="text-xs text-muted-foreground">
                    {QUARTER_LABELS[cp.quarter]}
                  </span>
                </div>
                <p className="text-sm font-medium">{cp.title}</p>
                {cp.description && (
                  <p className="text-xs text-muted-foreground">{cp.description}</p>
                )}
              </button>
              <button
                type="button"
                onClick={() => deleteCheckpoint(cp)}
                disabled={updating}
                aria-label="Delete checkpoint"
                className="rounded-md p-1 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </CardContent>
    </>
  )

  if (embedded) {
    return <div className="space-y-3">{body}</div>
  }

  return <Card>{body}</Card>
}
