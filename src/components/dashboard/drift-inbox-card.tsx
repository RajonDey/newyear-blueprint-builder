"use client"

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
import { DriftProcessDialog, type ProcessDialogMode } from "@/components/drifts/drift-process-dialog"
import { cn } from "@/lib/utils"

interface DriftInboxCardProps {
  total: number
  rows: Drift[]
  projects: { id: string; title: string }[]
  areas: { id: string; name: string }[]
}

/**
 * Dashboard affordance for the Drift inbox.
 *
 * Renders a calm panel (not a screaming notification) showing the most
 * recent quick-captures. Each drift can be promoted to a Task (with project
 * picker) or Note (with parent picker), or archived. The drift row itself
 * persists with `resolvedAt + resolvedAs` set so we keep the audit trail.
 *
 * The full triage surface lives at `/drifts` — this card is the *prompt*
 * that brings users back to it. We cap rendering at 8 rows here; anything
 * beyond that nudges the user to open the full page via "View all".
 */
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
      toast.success("Archived")
      startTransition(() => router.refresh())
    } catch {
      setItems((prev) => [...prev, d])
      toast.error("Network error.")
    }
  }

  async function destroy(d: Drift) {
    setItems((prev) => prev.filter((x) => x.id !== d.id))
    try {
      const res = await fetch(`/api/drifts/${d.id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems((prev) => [...prev, d])
        toast.error("Could not delete.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((prev) => [...prev, d])
      toast.error("Network error.")
    }
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-amber" />
            <h2 className="font-display text-lg tracking-tight">
              Drift inbox
            </h2>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {total} {total === 1 ? "thought" : "thoughts"} to organise
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/drifts"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Open full inbox
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-[11px] text-muted-foreground">⌘K to add more</span>
          </div>
        </div>
        <ul className="space-y-1.5">
          {items.slice(0, 8).map((d) => (
            <li
              key={d.id}
              className="group flex items-start gap-3 rounded-lg border border-border/70 p-3 text-sm bg-background/40"
            >
              <Brain className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="leading-relaxed">{d.content}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatDistanceToNowStrict(d.createdAt, { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          <p className="text-[11px] text-muted-foreground mt-3">
            Showing {items.length} of {total}.{" "}
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
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded p-1.5 transition-colors",
        destructive
          ? "text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {icon}
    </button>
  )
}

