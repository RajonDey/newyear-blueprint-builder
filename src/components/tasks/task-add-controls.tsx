"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckSquare, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  dateInputToIsoEndOfDay,
  defaultDateInputForBucket,
  defaultTargetDateForBucket,
  type TaskBucketKey,
} from "@/lib/tasks/bucket-dates"
import { createProjectTask } from "@/lib/tasks/create-task"
import {
  resolveDefaultTaskProjectId,
  writeLastTaskProjectId,
} from "@/lib/tasks/last-project"

export type TaskProjectOption = {
  id: string
  title: string
  type: string
  areaName: string | null
}

export function TasksHeaderActions({
  projects,
  defaultProjectId,
}: {
  projects: TaskProjectOption[]
  defaultProjectId: string | null
}) {
  return (
    <AddTaskDialog
      projects={projects}
      defaultProjectId={defaultProjectId}
      activeBucket="backlog"
    />
  )
}

type AddTaskDialogProps = {
  projects: TaskProjectOption[]
  defaultProjectId: string | null
  activeBucket: TaskBucketKey
}

export function AddTaskDialog({
  projects,
  defaultProjectId,
  activeBucket,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)

  if (projects.length === 0) {
    return (
      <Button size="sm" disabled className="gap-1.5">
        <Plus className="h-4 w-4" />
        Add task
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-amber" />
            Add task
          </DialogTitle>
          <DialogDescription>
            Attach a concrete move to a project. Leave the due date empty to send
            it to the backlog.
          </DialogDescription>
        </DialogHeader>
        <TaskAddForm
          projects={projects}
          defaultProjectId={defaultProjectId}
          activeBucket={activeBucket}
          showDueDate
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type TaskAddInlineRowProps = {
  projects: TaskProjectOption[]
  defaultProjectId: string | null
  bucket: TaskBucketKey
}

export function TaskAddInlineRow({
  projects,
  defaultProjectId,
  bucket,
}: TaskAddInlineRowProps) {
  if (projects.length === 0) return null

  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-4 py-3">
      <TaskAddForm
        projects={projects}
        defaultProjectId={defaultProjectId}
        activeBucket={bucket}
        inline
      />
    </div>
  )
}

function TaskAddForm({
  projects,
  defaultProjectId,
  activeBucket,
  showDueDate = false,
  inline = false,
  onSuccess,
}: {
  projects: TaskProjectOption[]
  defaultProjectId: string | null
  activeBucket: TaskBucketKey
  showDueDate?: boolean
  inline?: boolean
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [projectId, setProjectId] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setProjectId(resolveDefaultTaskProjectId(projects, defaultProjectId))
    if (showDueDate) {
      setDueDate(defaultDateInputForBucket(activeBucket))
    }
  }, [projects, defaultProjectId, activeBucket, showDueDate])

  async function submit(e?: React.FormEvent) {
    e?.preventDefault()
    const trimmed = description.trim()
    if (!trimmed || !projectId || submitting) return

    setSubmitting(true)
    try {
      const targetDate = showDueDate
        ? dueDate
          ? dateInputToIsoEndOfDay(dueDate)
          : null
        : defaultTargetDateForBucket(activeBucket)

      const result = await createProjectTask({
        projectId,
        description: trimmed,
        targetDate,
      })

      if (!result.ok) {
        toast.error(result.message, {
          action: result.upgradeUrl
            ? {
                label: "Upgrade",
                onClick: () => router.push(result.upgradeUrl!),
              }
            : undefined,
        })
        return
      }

      toast.success("Task added")
      setDescription("")
      if (showDueDate && activeBucket !== "backlog") {
        setDueDate(defaultDateInputForBucket(activeBucket))
      }
      onSuccess?.()
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  function onProjectChange(next: string) {
    setProjectId(next)
    writeLastTaskProjectId(next)
  }

  const bucketHint =
    activeBucket === "today"
      ? "Adds to Today"
      : activeBucket === "week"
        ? "Adds to This week"
        : "Adds to Backlog"

  return (
    <form
      onSubmit={submit}
      className={
        inline
          ? "flex flex-col gap-2 sm:flex-row sm:items-center"
          : "space-y-4"
      }
    >
      {inline && projects.length > 1 ? (
        <select
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          aria-label="Project"
          className="rounded-lg border border-border bg-background/60 px-2.5 py-2 text-xs sm:max-w-[11rem] sm:shrink-0"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
              {p.areaName ? ` · ${p.areaName}` : ""}
            </option>
          ))}
        </select>
      ) : null}

      {!inline && (
        <div className="space-y-1.5">
          <Label htmlFor="task-add-project">Project</Label>
          <select
            id="task-add-project"
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
                {p.areaName ? ` · ${p.areaName}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={
          inline ? `Next move · ${bucketHint.toLowerCase()}…` : "What's the move?"
        }
        maxLength={500}
        autoFocus={!inline}
        className={inline ? "flex-1" : undefined}
      />

      {showDueDate && (
        <div className="space-y-1.5">
          <Label htmlFor="task-add-due">Due date (optional)</Label>
          <Input
            id="task-add-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      )}

      <Button
        type="submit"
        size={inline ? "sm" : "default"}
        disabled={!description.trim() || !projectId || submitting}
        className={inline ? "gap-1.5 sm:shrink-0" : "gap-1.5"}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Adding…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" /> Add task
          </>
        )}
      </Button>
    </form>
  )
}
