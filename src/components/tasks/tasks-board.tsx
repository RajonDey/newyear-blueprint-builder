"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRightLeft,
  Check,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { format, isPast, isToday } from "date-fns"
import { toast } from "sonner"
import type { GoalStatus } from "@prisma/client"
import { areaHue } from "@/lib/level-styles"
import type { TaskBucketKey } from "@/lib/tasks/bucket-dates"
import { patchProjectTask } from "@/lib/tasks/patch-task"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TaskRow, TasksData } from "@/lib/queries/tasks"
import {
  TaskAddInlineRow,
  type TaskProjectOption,
} from "@/components/tasks/task-add-controls"
import {
  TaskEditDialog,
  type TaskEditValues,
} from "@/components/tasks/task-edit-dialog"
import { TaskSizeBadge } from "@/components/tasks/task-size-badge"
import { WeeklyPriorityBadge } from "@/components/shared/weekly-priority-badge"

interface TasksBoardProps {
  data: TasksData
  projects: TaskProjectOption[]
  defaultProjectId: string | null
  projectOptions: { id: string; title: string }[]
  priorityProjectIds?: string[]
}

type BucketKey = TaskBucketKey | "done"

const BUCKET_LABELS: Record<BucketKey, { label: string; copy: string }> = {
  today: { label: "Today", copy: "Due today and any overdue not-done items." },
  week: { label: "This week", copy: "Due before this ISO week ends." },
  backlog: { label: "Backlog", copy: "Anything without a date — pull when ready." },
  done: { label: "Done", copy: "Completed in the last 30 days." },
}

export function TasksBoard({
  data,
  projects,
  defaultProjectId,
  projectOptions,
  priorityProjectIds = [],
}: TasksBoardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const prioritySet = useMemo(
    () => new Set(priorityProjectIds),
    [priorityProjectIds],
  )
  const [areaFilter, setAreaFilter] = useState<string | "all">("all")
  const [bucket, setBucket] = useState<BucketKey>("today")
  const [editingTask, setEditingTask] = useState<TaskEditValues | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const areas = useMemo(() => {
    const map = new Map<string, string>()
    for (const list of [data.today, data.week, data.backlog, data.done]) {
      for (const t of list) {
        if (t.project.areaId && t.project.areaName) {
          map.set(t.project.areaId, t.project.areaName)
        }
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [data])

  const rows = (() => {
    const all = data[bucket]
    if (areaFilter === "all") return all
    return all.filter((t) => t.project.areaId === areaFilter)
  })()

  const canInlineAdd = bucket !== "done" && projects.length > 0

  function openEdit(task: TaskRow) {
    setEditingTask({
      id: task.id,
      description: task.description,
      type: task.type,
      targetDate: task.targetDate,
      projectId: task.project.id,
    })
    setEditOpen(true)
  }

  async function toggle(task: TaskRow) {
    const next: GoalStatus =
      task.status === "COMPLETED" ? "NOT_STARTED" : "COMPLETED"
    const result = await patchProjectTask(task.id, { status: next })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    startTransition(() => router.refresh())
  }

  async function remove(task: TaskRow) {
    if (!confirm(`Delete "${task.description}"?`)) return
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Could not remove task.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  async function moveToProject(task: TaskRow, projectId: string) {
    if (projectId === task.project.id) return
    const result = await patchProjectTask(task.id, { projectId })
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    toast.success("Task moved")
    startTransition(() => router.refresh())
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="inline-flex max-w-full flex-wrap rounded-lg border border-border p-0.5">
          {(Object.keys(BUCKET_LABELS) as BucketKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setBucket(k)}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors sm:min-h-0 sm:px-2.5 sm:py-1",
                bucket === k
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {BUCKET_LABELS[k].label}
              <span className="text-[10px] tabular-nums opacity-80">
                {data.counts[k]}
              </span>
            </button>
          ))}
        </div>

        {areas.length > 0 && (
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value as string | "all")}
            className="min-h-11 w-full rounded-lg border border-border bg-background/60 px-2.5 py-2 text-xs sm:min-h-0 sm:w-auto sm:py-1"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}

        <p className="text-xs text-muted-foreground sm:ml-auto">
          {BUCKET_LABELS[bucket].copy}
        </p>
      </div>

      {canInlineAdd && (
        <TaskAddInlineRow
          projects={projects}
          defaultProjectId={defaultProjectId}
          bucket={bucket}
        />
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nothing in {BUCKET_LABELS[bucket].label.toLowerCase()}.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            {projects.length === 0 ? (
              <>
                Add a{" "}
                <Link href="/projects" className="text-foreground hover:underline">
                  project
                </Link>{" "}
                first, then capture tasks here.
              </>
            ) : bucket === "done" ? (
              "Complete a task to see it here."
            ) : (
              "Use Add task above or the inline row to capture your next move."
            )}
          </p>
        </div>
      ) : (
        <ul className="rounded-2xl border border-border bg-card overflow-hidden">
          {rows.map((t, i) => (
            <TaskListRow
              key={t.id}
              task={t}
              isLast={i === rows.length - 1}
              isPriority={prioritySet.has(t.project.id)}
              projectOptions={projectOptions}
              onToggle={() => toggle(t)}
              onEdit={() => openEdit(t)}
              onDelete={() => remove(t)}
              onMoveToProject={(projectId) => moveToProject(t, projectId)}
            />
          ))}
        </ul>
      )}

      <TaskEditDialog
        task={editingTask}
        open={editOpen}
        onOpenChange={setEditOpen}
        projectOptions={projectOptions}
      />
    </>
  )
}

function TaskListRow({
  task,
  isLast,
  isPriority,
  projectOptions,
  onToggle,
  onEdit,
  onDelete,
  onMoveToProject,
}: {
  task: TaskRow
  isLast: boolean
  isPriority: boolean
  projectOptions: { id: string; title: string }[]
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onMoveToProject: (projectId: string) => void
}) {
  const hue = areaHue[task.project.category]
  const isCompleted = task.status === "COMPLETED"
  const dateLabel = task.targetDate
    ? isToday(task.targetDate)
      ? "Today"
      : format(task.targetDate, "MMM d")
    : null
  const overdue =
    !isCompleted &&
    task.targetDate != null &&
    isPast(task.targetDate) &&
    !isToday(task.targetDate)
  const projectHref = `/projects/${task.project.id}`

  return (
    <li
      className={cn(
        "flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/30 sm:grid sm:grid-cols-[auto_1fr_auto_auto] sm:items-center sm:gap-3",
        !isLast && "border-b border-border/70",
        isCompleted && "opacity-70",
      )}
      style={{
        borderLeft: isPriority
          ? "3px solid rgb(217 119 6 / 0.85)"
          : `3px solid hsl(${hue} / 0.55)`,
      }}
    >
      <div className="flex items-start gap-3 sm:contents">
        <button
          type="button"
          onClick={onToggle}
          aria-label="Toggle task"
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-4 sm:w-4",
            isCompleted
              ? "border-amber bg-amber text-background"
              : "border-muted-foreground/40 hover:border-amber",
          )}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>

        <Link
          href={projectHref}
          className="min-w-0 flex-1 group/link rounded-md -my-1 py-1 pr-2 transition-colors hover:bg-muted/40 sm:col-start-2"
        >
          <div className="flex items-start gap-2 min-w-0">
            <span
              className={cn(
                "text-sm leading-snug group-hover/link:underline underline-offset-2",
                isCompleted && "line-through decoration-muted-foreground/60",
              )}
            >
              {task.description}
            </span>
            <TaskSizeBadge type={task.type} className="mt-0.5 shrink-0" />
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 min-w-0">
              {task.project.areaName ?? task.project.category}
              <ChevronRight className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{task.project.title}</span>
            </span>
            {isPriority && (
              <WeeklyPriorityBadge className="normal-case tracking-normal" />
            )}
            <span className="hidden text-muted-foreground/40 sm:inline">·</span>
            <span className="hidden opacity-0 transition-opacity group-hover/link:opacity-100 sm:inline">
              View project
            </span>
          </div>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Task actions"
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground transition-colors sm:ml-0 sm:h-auto sm:w-auto sm:p-1 sm:text-muted-foreground/40"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onEdit} className="gap-2 min-h-11 sm:min-h-0">
              <Pencil className="h-3.5 w-3.5" /> Edit task…
            </DropdownMenuItem>
            {projectOptions.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2 min-h-11 sm:min-h-0">
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    Move to project…
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="max-h-80 overflow-y-auto">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Move to
                    </DropdownMenuLabel>
                    {projectOptions.map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onSelect={() => onMoveToProject(p.id)}
                        className="gap-2 min-h-11 sm:min-h-0"
                        disabled={p.id === task.project.id}
                      >
                        {p.id === task.project.id ? (
                          <Check className="h-3.5 w-3.5 text-amber" />
                        ) : (
                          <span className="h-3.5 w-3.5" />
                        )}
                        <span className="truncate">{p.title}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="gap-2 min-h-11 text-destructive focus:text-destructive sm:min-h-0"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <button
        type="button"
        onClick={onEdit}
        className={cn(
          "self-start rounded px-2 py-1.5 text-[11px] tabular-nums text-left transition-colors hover:bg-muted/60 sm:col-start-3 sm:-mx-1.5 sm:px-1.5 sm:py-0.5",
          overdue ? "text-rose-600" : "text-muted-foreground",
        )}
        title="Edit due date"
      >
        {dateLabel ? (
          <span>{overdue ? `Overdue · ${dateLabel}` : dateLabel}</span>
        ) : (
          <span className="text-muted-foreground/60">Undated</span>
        )}
      </button>
    </li>
  )
}
