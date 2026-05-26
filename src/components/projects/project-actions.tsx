"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, MoreHorizontal, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Per-card action menu for a Project on the `/projects` grid: Move up / Move
 * down / Delete.
 *
 * Reordering is bucket-local — primary projects only swap with primaries,
 * secondaries only with secondaries — because the `/projects` page renders
 * them in two separate sections sorted by `[type ASC, sortOrder ASC]`.
 *
 * The reorder API takes a flat list of all project IDs, so we send the
 * full ordered list with the single swap applied; relative order within
 * each bucket is what determines display order on next fetch.
 */
interface ProjectActionsProps {
  projectId: string
  /** All project IDs in their currently-rendered order (primary then secondary). */
  orderedIds: string[]
  /** IDs of projects this one can swap with — same `type` bucket. */
  bucketIds: string[]
}

export function ProjectActions({
  projectId,
  orderedIds,
  bucketIds,
}: ProjectActionsProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)

  const bucketIdx = bucketIds.indexOf(projectId)
  const isFirst = bucketIdx <= 0
  const isLast = bucketIdx === -1 || bucketIdx >= bucketIds.length - 1

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function move(direction: "up" | "down") {
    if (bucketIdx === -1) return
    const swapBucketIdx = direction === "up" ? bucketIdx - 1 : bucketIdx + 1
    if (swapBucketIdx < 0 || swapBucketIdx >= bucketIds.length) return
    const neighborId = bucketIds[swapBucketIdx]
    const a = orderedIds.indexOf(projectId)
    const b = orderedIds.indexOf(neighborId)
    if (a === -1 || b === -1) return
    const reordered = [...orderedIds]
    ;[reordered[a], reordered[b]] = [reordered[b], reordered[a]]

    setSubmitting(true)
    try {
      const res = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectIds: reordered }),
      })
      if (!res.ok) {
        toast.error("Could not reorder.")
        return
      }
      refresh()
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  async function destroy() {
    if (
      !confirm(
        "Delete this project? Tasks, systems, and check-ins inside it go with it.",
      )
    ) {
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Could not delete project.")
        return
      }
      toast.success("Project deleted")
      refresh()
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Project actions"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          disabled={submitting}
          className="absolute top-3 right-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted/60 hover:text-foreground group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-44"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          className="gap-2"
          disabled={isFirst}
          onSelect={() => move("up")}
        >
          <ArrowUp className="h-3.5 w-3.5" /> Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2"
          disabled={isLast}
          onSelect={() => move("down")}
        >
          <ArrowDown className="h-3.5 w-3.5" /> Move down
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={destroy}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
