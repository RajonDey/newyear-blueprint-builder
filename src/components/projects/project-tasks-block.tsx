"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { format, isToday } from "date-fns"
import { toast } from "sonner"
import type { GoalStatus } from "@prisma/client"
import { patchProjectTask } from "@/lib/tasks/patch-task"
import { cn } from "@/lib/utils"
import {
  TaskEditDialog,
  type TaskEditValues,
} from "@/components/tasks/task-edit-dialog"
import { TaskSizeBadge } from "@/components/tasks/task-size-badge"

interface Task {
  id: string
  description: string
  type: "SMALL" | "MEDIUM" | "BIG"
  status: GoalStatus
  targetDate?: Date | string | null
}

interface ProjectTasksBlockProps {
  projectId: string
  initialTasks: Task[]
  cap: number
}

export function ProjectTasksBlock({
  projectId,
  initialTasks,
  cap,
}: ProjectTasksBlockProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draft, setDraft] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskEditValues | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const total = tasks.length
  const done = tasks.filter((t) => t.status === "COMPLETED").length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0
  const atCap = total >= cap

  function openEdit(task: Task) {
    setEditingTask({
      id: task.id,
      description: task.description,
      type: task.type,
      targetDate: task.targetDate ?? null,
      projectId,
    })
    setEditOpen(true)
  }

  async function add() {
    const text = draft.trim()
    if (!text || submitting) return
    if (atCap) {
      toast.error(`Reached the cap of ${cap} tasks for this project.`)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not add task.")
        return
      }
      setTasks((prev) => [...prev, body.data])
      setDraft("")
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function toggle(task: Task) {
    const next: GoalStatus = task.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: next } : t)),
    )
    const result = await patchProjectTask(task.id, { status: next })
    if (!result.ok) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)),
      )
      toast.error(result.message)
      return
    }
    startTransition(() => router.refresh())
  }

  async function remove(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" })
      if (!res.ok) {
        setTasks((prev) => [...prev, task])
        toast.error("Could not remove task.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setTasks((prev) => [...prev, task])
      toast.error("Network error.")
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="font-display text-xl tracking-tight">Tasks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The discrete moves that make this project real.
          </p>
        </div>
        <div className="text-xs text-muted-foreground tabular-nums">
          {done}/{total} · {progress}%
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No tasks yet. Add the first concrete move below.
        </p>
      ) : (
        <ul className="space-y-1">
          {tasks.map((t) => {
            const dueLabel = t.targetDate
              ? isToday(new Date(t.targetDate))
                ? "Today"
                : format(new Date(t.targetDate), "MMM d")
              : null

            return (
              <li
                key={t.id}
                className="group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(t)}
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                    t.status === "COMPLETED"
                      ? "border-amber bg-amber text-background"
                      : "border-muted-foreground/40 hover:border-amber",
                  )}
                  aria-label="Toggle task"
                >
                  {t.status === "COMPLETED" && <Check className="h-3 w-3" />}
                </button>

                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  className={cn(
                    "min-w-0 flex-1 text-left rounded px-1 -mx-1 py-0.5 transition-colors hover:bg-muted/60",
                    t.status === "COMPLETED" &&
                      "text-muted-foreground line-through decoration-muted-foreground/60",
                  )}
                >
                  {t.description}
                </button>

                <TaskSizeBadge type={t.type} />

                {dueLabel ? (
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="text-[10px] tabular-nums text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {dueLabel}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => openEdit(t)}
                  aria-label="Edit task"
                  className="rounded p-1 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => remove(t)}
                  aria-label="Remove task"
                  className="rounded p-1 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={atCap ? `At ${cap}-task cap` : "Next move on this project…"}
          disabled={atCap}
          className="flex-1 rounded-md border border-dashed border-border/60 bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-amber/40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || submitting || atCap}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      <TaskEditDialog
        task={editingTask}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </section>
  )
}
