"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { ActionType } from "@prisma/client"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dateInputToIsoEndOfDay } from "@/lib/tasks/bucket-dates"
import { patchProjectTask } from "@/lib/tasks/patch-task"
import { taskDateToInputValue } from "@/lib/tasks/task-display"

export type TaskEditValues = {
  id: string
  description: string
  type: ActionType
  targetDate: Date | string | null
  projectId: string
}

type TaskEditDialogProps = {
  task: TaskEditValues | null
  open: boolean
  onOpenChange: (open: boolean) => void
  projectOptions?: { id: string; title: string }[]
}

export function TaskEditDialog({
  task,
  open,
  onOpenChange,
  projectOptions,
}: TaskEditDialogProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [description, setDescription] = useState("")
  const [type, setType] = useState<ActionType>("SMALL")
  const [dueDate, setDueDate] = useState("")
  const [projectId, setProjectId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!task || !open) return
    setDescription(task.description)
    setType(task.type)
    setDueDate(taskDateToInputValue(task.targetDate))
    setProjectId(task.projectId)
  }, [task, open])

  async function save() {
    if (!task) return
    const trimmed = description.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    try {
      const result = await patchProjectTask(task.id, {
        description: trimmed,
        type,
        targetDate: dueDate ? dateInputToIsoEndOfDay(dueDate) : null,
        ...(projectOptions && projectId !== task.projectId
          ? { projectId }
          : {}),
      })

      if (!result.ok) {
        toast.error(result.message)
        return
      }

      toast.success("Task updated")
      onOpenChange(false)
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display tracking-tight">Edit task</DialogTitle>
          <DialogDescription>
            Rename, resize, or reschedule. Clear the due date to send it to the backlog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-edit-description">Task</Label>
            <Input
              id="task-edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="task-edit-size">Size</Label>
              <select
                id="task-edit-size"
                value={type}
                onChange={(e) => setType(e.target.value as ActionType)}
                className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="BIG">Big</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-edit-due">Due date</Label>
              <Input
                id="task-edit-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {projectOptions && projectOptions.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="task-edit-project">Project</Label>
              <select
                id="task-edit-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
              >
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={save}
            disabled={!description.trim() || submitting}
            className="gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
