"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Dashboard drift inbox — visible actions, Undo on archive/delete (§7, Wave C).
 */

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Archive,
  ArrowRight,
  Brain,
  CheckSquare,
  Inbox,
  StickyNote,
  Trash2,
} from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import type { Drift } from "@prisma/client"
import {
  DriftProcessDialog,
  type ProcessDialogMode,
} from "@/components/drifts/drift-process-dialog"
import { cn } from "@/lib/utils"

const UNDO_MS = 7000

interface DriftInboxCardProps {
  total: number
  rows: Drift[]
  projects: { id: string; title: string }[]
  areas: { id: string; name: string }[]
}

export function DriftInboxCard({
  total,
  rows,
  projects,
  areas,
}: DriftInboxCardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, setItems] = useState<Drift[]>(rows)
  const [processing, setProcessing] = useState<Drift | null>(null)
  const [mode, setMode] = useState<ProcessDialogMode | null>(null)

  if (items.length === 0) {
    return null
  }

  async function archive(d: Drift) {
    setItems((prev) => prev.filter((x) => x.id !== d.id))
    try {
      const res = await fetch(`/api/drifts/${d.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "archive" }),
      })
      if (!res.ok) {
        setItems((prev) => [...prev, d])
        toast.error("Could not archive.")
        return
      }
      startTransition(() => router.refresh())
      toast("Archived", {
        duration: UNDO_MS,
        action: {
          label: "Undo",
          onClick: () => void restoreArchive(d),
        },
      })
    } catch {
      setItems((prev) => [...prev, d])
      toast.error("Network error.")
    }
  }

  async function restoreArchive(d: Drift) {
    try {
      const res = await fetch(`/api/drifts/${d.id}/restore`, { method: "POST" })
      if (!res.ok) {
        toast.error("Could not restore.")
        return
      }
      setItems((prev) => {
        if (prev.some((x) => x.id === d.id)) return prev
        return [d, ...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      })
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  async function destroy(d: Drift) {
    const snapshot = { content: d.content, kind: d.kind }
    setItems((prev) => prev.filter((x) => x.id !== d.id))
    try {
      const res = await fetch(`/api/drifts/${d.id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems((prev) => [...prev, d])
        toast.error("Could not delete.")
        return
      }
      startTransition(() => router.refresh())
      toast("Deleted", {
        duration: UNDO_MS,
        action: {
          label: "Undo",
          onClick: () => void recreate(snapshot, d),
        },
      })
    } catch {
      setItems((prev) => [...prev, d])
      toast.error("Network error.")
    }
  }

  async function recreate(
    snapshot: { content: string; kind: Drift["kind"] },
    original: Drift,
  ) {
    try {
      const res = await fetch("/api/drifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshot),
      })
      if (!res.ok) {
        toast.error("Could not restore.")
        return
      }
      const body = (await res.json()) as { data: Drift }
      setItems((prev) => {
        const next = prev.filter((x) => x.id !== original.id)
        if (next.some((x) => x.id === body.data.id)) return next
        return [body.data, ...next]
      })
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  return (
    <>
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h2 className="font-display text-lg tracking-tight inline-flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber" aria-hidden />
              Drift inbox
            </h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {total} {total === 1 ? "thought" : "thoughts"} to organise
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Link
              href="/drifts"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Open full inbox
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="hidden sm:inline">⌘K to add more</span>
          </div>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {items.slice(0, 8).map((d) => (
            <li
              key={d.id}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:gap-4 sm:py-3.5"
            >
              <Brain
                className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block mt-0.5"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-relaxed">{d.content}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNowStrict(d.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 sm:mt-0.5">
                <ActionButton
                  label="Make a task"
                  icon={<CheckSquare className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setProcessing(d)
                    setMode("task")
                  }}
                />
                <ActionButton
                  label="Save as note"
                  icon={<StickyNote className="h-3.5 w-3.5" />}
                  onClick={() => {
                    setProcessing(d)
                    setMode("note")
                  }}
                />
                <ActionButton
                  label="Archive"
                  icon={<Archive className="h-3.5 w-3.5" />}
                  onClick={() => archive(d)}
                />
                <ActionButton
                  label="Delete"
                  destructive
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => destroy(d)}
                />
              </div>
            </li>
          ))}
        </ul>

        {total > items.length && (
          <p className="text-[11px] text-muted-foreground">
            Showing {Math.min(items.length, 8)} of {total}.{" "}
            <Link
              href="/drifts"
              className="text-foreground/80 hover:text-foreground underline underline-offset-2"
            >
              Open full inbox
            </Link>
            .
          </p>
        )}
      </section>

      {processing && mode && (
        <DriftProcessDialog
          drift={processing}
          mode={mode}
          projects={projects}
          areas={areas}
          onClose={() => {
            setProcessing(null)
            setMode(null)
          }}
          onSuccess={(d) => {
            setItems((prev) => prev.filter((x) => x.id !== d.id))
            setProcessing(null)
            setMode(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </>
  )
}

function ActionButton({
  label,
  icon,
  onClick,
  destructive,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "min-h-11 min-w-11 rounded p-2 transition-colors sm:min-h-0 sm:min-w-0 sm:p-1.5",
        destructive
          ? "text-muted-foreground hover:text-status-risk hover:bg-status-risk/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {icon}
    </button>
  )
}
