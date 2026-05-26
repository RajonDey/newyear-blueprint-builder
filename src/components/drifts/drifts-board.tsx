"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Full drift inbox — divided list, Undo on archive/delete (§7, Wave D4).
 */

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Archive,
  ArrowRight,
  Brain,
  Check,
  CheckSquare,
  Inbox,
  Pencil,
  Search,
  StickyNote,
  Trash2,
  X,
} from "lucide-react"
import { formatDistanceToNowStrict } from "date-fns"
import { toast } from "sonner"
import type { Drift } from "@prisma/client"
import {
  DriftProcessDialog,
  type ProcessDialogMode,
} from "@/components/drifts/drift-process-dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const UNDO_MS = 7000

type Tab = "inbox" | "resolved"

interface DriftsBoardProps {
  initialInbox: Drift[]
  initialResolved: Drift[]
  counts: { inbox: number; resolved: number; total: number }
  projects: { id: string; title: string }[]
  areas: { id: string; name: string }[]
  /** Optional drift id to scroll into view + highlight (from `?focus=`). */
  focusId?: string | null
}

export function DriftsBoard({
  initialInbox,
  initialResolved,
  counts,
  projects,
  areas,
  focusId,
}: DriftsBoardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<Tab>(
    initialInbox.length === 0 && initialResolved.length > 0
      ? "resolved"
      : "inbox",
  )
  const [search, setSearch] = useState("")
  const [inboxItems, setInboxItems] = useState<Drift[]>(initialInbox)
  const [resolvedItems, setResolvedItems] = useState<Drift[]>(initialResolved)
  const [processing, setProcessing] = useState<Drift | null>(null)
  const [mode, setMode] = useState<ProcessDialogMode | null>(null)

  useEffect(() => {
    setInboxItems(initialInbox)
  }, [initialInbox])
  useEffect(() => {
    setResolvedItems(initialResolved)
  }, [initialResolved])

  useEffect(() => {
    const handle = setTimeout(() => {
      const next = search.trim()
      const params = new URLSearchParams(window.location.search)
      if (next) params.set("q", next)
      else params.delete("q")
      const qs = params.toString()
      router.replace(`/drifts${qs ? `?${qs}` : ""}`, { scroll: false })
    }, 250)
    return () => clearTimeout(handle)
  }, [search, router])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get("q") ?? ""
    if (q) setSearch(q)
  }, [])

  const visibleItems = useMemo(
    () => (tab === "inbox" ? inboxItems : resolvedItems),
    [tab, inboxItems, resolvedItems],
  )

  async function archive(d: Drift) {
    setInboxItems((prev) => prev.filter((x) => x.id !== d.id))
    try {
      const res = await fetch(`/api/drifts/${d.id}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "archive" }),
      })
      if (!res.ok) {
        setInboxItems((prev) => [d, ...prev])
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
      setInboxItems((prev) => [d, ...prev])
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
      setInboxItems((prev) => {
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

  async function destroy(d: Drift, fromTab: Tab) {
    const setter = fromTab === "inbox" ? setInboxItems : setResolvedItems
    const snapshot = { content: d.content, kind: d.kind }
    setter((prev) => prev.filter((x) => x.id !== d.id))
    try {
      const res = await fetch(`/api/drifts/${d.id}`, { method: "DELETE" })
      if (!res.ok) {
        setter((prev) => [d, ...prev])
        toast.error("Could not delete.")
        return
      }
      startTransition(() => router.refresh())
      toast("Deleted", {
        duration: UNDO_MS,
        action: {
          label: "Undo",
          onClick: () => void recreate(snapshot, d, fromTab),
        },
      })
    } catch {
      setter((prev) => [d, ...prev])
      toast.error("Network error.")
    }
  }

  async function recreate(
    snapshot: { content: string; kind: Drift["kind"] },
    original: Drift,
    fromTab: Tab,
  ) {
    const setter = fromTab === "inbox" ? setInboxItems : setResolvedItems
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
      setter((prev) => {
        const next = prev.filter((x) => x.id !== original.id)
        if (next.some((x) => x.id === body.data.id)) return next
        return [body.data, ...next]
      })
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    }
  }

  async function saveEdit(d: Drift, nextContent: string) {
    const trimmed = nextContent.trim()
    if (!trimmed || trimmed === d.content) return
    const prev = d.content
    setInboxItems((curr) =>
      curr.map((x) => (x.id === d.id ? { ...x, content: trimmed } : x)),
    )
    try {
      const res = await fetch(`/api/drifts/${d.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      })
      if (!res.ok) {
        setInboxItems((curr) =>
          curr.map((x) => (x.id === d.id ? { ...x, content: prev } : x)),
        )
        const body = await res.json().catch(() => null)
        toast.error(body?.message || body?.error || "Could not save.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setInboxItems((curr) =>
        curr.map((x) => (x.id === d.id ? { ...x, content: prev } : x)),
      )
      toast.error("Network error.")
    }
  }

  return (
    <div className="space-y-6">
      <Tabs
        tab={tab}
        onChange={setTab}
        counts={{ inbox: counts.inbox, resolved: counts.resolved }}
      />

      <SearchBox value={search} onChange={setSearch} />

      {visibleItems.length === 0 ? (
        <EmptyState tab={tab} hasSearch={search.trim().length > 0} />
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {visibleItems.map((d) => (
            <DriftRow
              key={d.id}
              drift={d}
              tab={tab}
              highlight={d.id === focusId}
              onMakeTask={() => {
                setProcessing(d)
                setMode("task")
              }}
              onMakeNote={() => {
                setProcessing(d)
                setMode("note")
              }}
              onArchive={() => archive(d)}
              onDelete={() => destroy(d, tab)}
              onSaveEdit={(next) => saveEdit(d, next)}
            />
          ))}
        </ul>
      )}

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
            setInboxItems((prev) => prev.filter((x) => x.id !== d.id))
            setProcessing(null)
            setMode(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </div>
  )
}

function Tabs({
  tab,
  onChange,
  counts,
}: {
  tab: Tab
  onChange: (next: Tab) => void
  counts: { inbox: number; resolved: number }
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card/40 p-1">
      <TabPill
        active={tab === "inbox"}
        onClick={() => onChange("inbox")}
        label="Inbox"
        count={counts.inbox}
        icon={<Inbox className="h-3.5 w-3.5" />}
      />
      <TabPill
        active={tab === "resolved"}
        onClick={() => onChange("resolved")}
        label="Resolved"
        count={counts.resolved}
        icon={<Archive className="h-3.5 w-3.5" />}
      />
    </div>
  )
}

function TabPill({
  active,
  onClick,
  label,
  count,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors min-h-11 sm:min-h-0 sm:py-1.5",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
      <span
        className={cn(
          "ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums",
          active
            ? "bg-amber/10 text-amber"
            : "bg-muted text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  )
}

function SearchBox({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search your captures…"
        className="pl-9 pr-9"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

function DriftRow({
  drift,
  tab,
  highlight,
  onMakeTask,
  onMakeNote,
  onArchive,
  onDelete,
  onSaveEdit,
}: {
  drift: Drift
  tab: Tab
  highlight?: boolean
  onMakeTask: () => void
  onMakeNote: () => void
  onArchive: () => void
  onDelete: () => void
  onSaveEdit: (next: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(drift.content)
  const resolvedLabel = drift.resolvedAs
    ? labelForResolved(drift.resolvedAs)
    : null

  function commit() {
    onSaveEdit(draft)
    setEditing(false)
  }
  function cancel() {
    setDraft(drift.content)
    setEditing(false)
  }

  return (
    <li
      id={`drift-${drift.id}`}
      className={cn(
        "group flex flex-col gap-3 py-3.5 text-sm transition-colors sm:flex-row sm:items-start sm:py-4",
        highlight && "bg-amber-tint",
      )}
    >
      <Brain className="hidden h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0 sm:block" />
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Brain className="h-3.5 w-3.5 text-muted-foreground mt-1 shrink-0 sm:hidden" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  commit()
                }
                if (e.key === "Escape") cancel()
              }}
              rows={Math.max(2, Math.min(8, draft.split("\n").length + 1))}
              className="w-full resize-none rounded-md border border-border bg-background/60 p-2 text-sm leading-relaxed outline-none focus:border-amber/40"
            />
          ) : (
            <p className="leading-relaxed whitespace-pre-wrap">{drift.content}</p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              Captured{" "}
              {formatDistanceToNowStrict(drift.createdAt, { addSuffix: true })}
            </span>
            {tab === "resolved" && resolvedLabel && (
              <>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1 text-foreground/80">
                  {resolvedLabel.icon}
                  {resolvedLabel.text}
                  {drift.resolvedAt && (
                    <span className="text-muted-foreground">
                      {" "}
                      ·{" "}
                      {formatDistanceToNowStrict(drift.resolvedAt, {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </span>
              </>
            )}
            {editing && (
              <span className="text-muted-foreground/70">
                ⌘Enter to save · Esc to cancel
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 sm:shrink-0",
          editing
            ? "opacity-100"
            : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
        )}
      >
        {editing ? (
          <>
            <RowAction
              label="Cancel"
              icon={<X className="h-3.5 w-3.5" />}
              onClick={cancel}
            />
            <RowAction
              label="Save"
              icon={<Check className="h-3.5 w-3.5 text-status-positive" />}
              onClick={commit}
            />
          </>
        ) : (
          <>
            {tab === "inbox" && (
              <>
                <RowAction
                  label="Edit"
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  onClick={() => setEditing(true)}
                />
                <RowAction
                  label="Make a task"
                  icon={<CheckSquare className="h-3.5 w-3.5" />}
                  onClick={onMakeTask}
                />
                <RowAction
                  label="Save as note"
                  icon={<StickyNote className="h-3.5 w-3.5" />}
                  onClick={onMakeNote}
                />
                <RowAction
                  label="Archive"
                  icon={<Archive className="h-3.5 w-3.5" />}
                  onClick={onArchive}
                />
              </>
            )}
            <RowAction
              label="Delete"
              destructive
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={onDelete}
            />
          </>
        )}
      </div>
    </li>
  )
}

function RowAction({
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
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors sm:min-h-0 sm:min-w-0 sm:p-1.5",
        destructive
          ? "text-muted-foreground hover:text-status-risk hover:bg-status-risk/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {icon}
    </button>
  )
}

function EmptyState({ tab, hasSearch }: { tab: Tab; hasSearch: boolean }) {
  if (hasSearch) {
    return (
      <div className="border border-dashed border-border px-6 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No drifts match this search. Try a shorter query, or clear it to see
          everything.
        </p>
      </div>
    )
  }
  if (tab === "inbox") {
    return (
      <div className="border border-dashed border-border px-6 py-8 text-center">
        <Inbox className="mx-auto h-6 w-6 text-muted-foreground/60" />
        <h3 className="font-display text-lg mt-3">Inbox zero</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto leading-relaxed">
          Nothing waiting for you. Press{" "}
          <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>{" "}
          anywhere to capture a thought — it&apos;ll show up here when you&apos;re
          ready to organise it.
        </p>
      </div>
    )
  }
  return (
    <div className="border border-dashed border-border px-6 py-8 text-center">
      <p className="text-sm text-muted-foreground">
        Nothing resolved yet. As you process drifts they&apos;ll move here so
        you can see the trail.
      </p>
    </div>
  )
}

function labelForResolved(resolvedAs: string): {
  text: string
  icon: React.ReactNode
} | null {
  switch (resolvedAs) {
    case "TASK":
      return {
        text: "Promoted to task",
        icon: <CheckSquare className="h-3 w-3" />,
      }
    case "NOTE":
      return {
        text: "Saved as note",
        icon: <StickyNote className="h-3 w-3" />,
      }
    case "ARCHIVED":
      return {
        text: "Archived",
        icon: <Archive className="h-3 w-3" />,
      }
    default:
      return {
        text: "Resolved",
        icon: <ArrowRight className="h-3 w-3" />,
      }
  }
}
