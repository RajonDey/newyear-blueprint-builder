"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Drift promotion dialog — silent success, plain field labels (Wave D4).
 */

import { useState } from "react"
import { CheckSquare, Loader2, StickyNote, X } from "lucide-react"
import { toast } from "sonner"
import type { Drift } from "@prisma/client"
import { ParentType } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export type ProcessDialogMode = "task" | "note"

interface ProcessDialogProps {
  drift: Drift
  mode: ProcessDialogMode
  projects: { id: string; title: string }[]
  areas: { id: string; name: string }[]
  onClose: () => void
  onSuccess: (drift: Drift) => void
}

/**
 * Shared dialog for promoting a Drift into a Task or Note.
 *
 * Used by both the dashboard `<DriftInboxCard>` and the `/drifts` page so
 * the promotion UX stays identical no matter where the user processes
 * from. POSTs to `/api/drifts/[id]/process`; the server keeps the drift
 * row but stamps `resolvedAt + resolvedAs + resolvedRef` for audit.
 */
export function DriftProcessDialog({
  drift,
  mode,
  projects,
  areas,
  onClose,
  onSuccess,
}: ProcessDialogProps) {
  const [content, setContent] = useState(drift.content)
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "")
  const [parentType, setParentType] = useState<ParentType>(
    projects.length > 0 ? ParentType.PROJECT : ParentType.AREA,
  )
  const [parentId, setParentId] = useState(
    projects[0]?.id ?? areas[0]?.id ?? "",
  )
  const [submitting, setSubmitting] = useState(false)

  const parentOptions =
    parentType === ParentType.PROJECT
      ? projects.map((p) => ({ id: p.id, label: p.title }))
      : areas.map((a) => ({ id: a.id, label: a.name }))

  async function submit() {
    if (!content.trim() || submitting) return
    if (mode === "task" && !projectId) {
      toast.error("Pick a project for this task.")
      return
    }
    if (mode === "note" && !parentId) {
      toast.error("Pick a parent for this note.")
      return
    }
    setSubmitting(true)
    try {
      const payload =
        mode === "task"
          ? {
              target: "task",
              projectId,
              description: content.trim().slice(0, 500),
            }
          : {
              target: "note",
              parentType,
              parentId,
              content: content.trim(),
            }
      const res = await fetch(`/api/drifts/${drift.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not process.")
        return
      }
      onSuccess(drift)
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[90vh] max-sm:translate-x-0 max-sm:translate-y-0 max-sm:overflow-y-auto max-sm:rounded-b-none max-sm:rounded-t-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            {mode === "task" ? (
              <CheckSquare className="h-4 w-4 text-amber" />
            ) : (
              <StickyNote className="h-4 w-4 text-amber" />
            )}
            {mode === "task" ? "Make this a task" : "Save as a note"}
          </DialogTitle>
          <DialogDescription>
            {mode === "task"
              ? "Pick the project this belongs to. You can edit the text before saving."
              : "Pick where this note should live. Notes attach to areas, projects, tasks, systems, or your vision."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
          />

          {mode === "task" ? (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm"
              >
                {projects.length === 0 && (
                  <option value="">No projects available</option>
                )}
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Attach to</label>
                <select
                  value={parentType}
                  onChange={(e) => {
                    const next = e.target.value as ParentType
                    setParentType(next)
                    setParentId(
                      next === ParentType.PROJECT
                        ? projects[0]?.id ?? ""
                        : areas[0]?.id ?? "",
                    )
                  }}
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm"
                >
                  <option value={ParentType.PROJECT}>Project</option>
                  <option value={ParentType.AREA}>Area</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  {parentType === ParentType.PROJECT ? "Project" : "Area"}
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm"
                >
                  {parentOptions.length === 0 && (
                    <option value="">None available</option>
                  )}
                  {parentOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors sm:min-h-0 sm:py-1.5"
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity sm:min-h-0 sm:py-1.5"
          >
            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {submitting
              ? "Saving…"
              : mode === "task"
                ? "Save as task"
                : "Save as note"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
