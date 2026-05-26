"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Knowledge notes index — divided list, status tokens (Wave D4).
 */

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ExternalLink,
  Pencil,
  Pin,
  PinOff,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { NoteIndexRow } from "@/lib/queries/knowledge-index"
import { KnowledgeIndexFilters } from "./knowledge-index-filters"

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function NotesIndexBoard({
  initialItems,
  initialCursor,
  total,
  areas,
  filters,
}: {
  initialItems: NoteIndexRow[]
  initialCursor: string | null
  total: number
  areas: { id: string; name: string }[]
  filters: { parentType?: string; areaId?: string }
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState(initialCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")

  async function loadMore() {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({ cursor, limit: "20" })
      if (filters.parentType) params.set("parentType", filters.parentType)
      if (filters.areaId) params.set("areaId", filters.areaId)
      const res = await fetch(`/api/knowledge/notes?${params}`)
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.data) {
        toast.error("Could not load more notes.")
        return
      }
      setItems((prev) => [...prev, ...(body.data.items as NoteIndexRow[])])
      setCursor(body.data.nextCursor ?? null)
    } finally {
      setLoadingMore(false)
    }
  }

  function startEdit(note: NoteIndexRow) {
    setEditingId(note.id)
    setEditDraft(note.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft("")
  }

  async function saveEdit(note: NoteIndexRow) {
    const next = editDraft.trim()
    if (!next || next === note.content) {
      cancelEdit()
      return
    }
    const prev = note.content
    setItems((curr) =>
      curr.map((n) => (n.id === note.id ? { ...n, content: next } : n)),
    )
    setEditingId(null)
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      })
      if (!res.ok) {
        setItems((curr) =>
          curr.map((n) => (n.id === note.id ? { ...n, content: prev } : n)),
        )
        toast.error("Could not save note.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) =>
        curr.map((n) => (n.id === note.id ? { ...n, content: prev } : n)),
      )
      toast.error("Network error.")
    }
  }

  async function togglePin(note: NoteIndexRow) {
    const next = !note.pinned
    setItems((curr) =>
      curr.map((n) => (n.id === note.id ? { ...n, pinned: next } : n)),
    )
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next }),
      })
      if (!res.ok) {
        setItems((curr) =>
          curr.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n)),
        )
        toast.error("Could not update pin.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) =>
        curr.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n)),
      )
      toast.error("Network error.")
    }
  }

  async function remove(note: NoteIndexRow) {
    setItems((curr) => curr.filter((n) => n.id !== note.id))
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems((curr) => [...curr, note])
        toast.error("Could not delete note.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) => [...curr, note])
      toast.error("Network error.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <KnowledgeIndexFilters areas={areas} basePath="/knowledge/notes" />
        <p className="text-xs text-muted-foreground tabular-nums">
          {total} note{total !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No notes match these filters. Notes live on areas, projects, and vision —
            add them from any detail page, or use{" "}
            <span className="text-foreground">⌘K</span> search to find one.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((note) => (
            <li
              key={note.id}
              className={cn(
                "group px-0 py-4 transition-colors hover:bg-muted/20",
                note.pinned && "bg-amber-tint",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={note.parentHref}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    {note.parent.areaName ? (
                      <>
                        <span>{note.parent.areaName}</span>
                        <ChevronRight className="h-2.5 w-2.5" />
                      </>
                    ) : null}
                    <span>{note.parent.label}</span>
                    <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>

                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
                    {note.pinned && (
                      <span className="inline-flex items-center gap-1 text-amber">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>

                  {editingId === note.id ? (
                    <Textarea
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          void saveEdit(note)
                        }
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="min-h-[80px] resize-none text-sm"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {editingId === note.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void saveEdit(note)}
                        aria-label="Save note"
                        className="rounded p-1 text-status-positive hover:bg-status-positive/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        aria-label="Cancel edit"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={note.parentHref}
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                        aria-label="Open parent"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => startEdit(note)}
                        aria-label="Edit note"
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void togglePin(note)}
                        aria-label={note.pinned ? "Unpin note" : "Pin note"}
                        className="rounded p-1 text-muted-foreground hover:text-foreground"
                      >
                        {note.pinned ? (
                          <PinOff className="h-3.5 w-3.5" />
                        ) : (
                          <Pin className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(note)}
                        aria-label="Delete note"
                        className="rounded p-1 text-muted-foreground hover:text-status-risk"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {cursor ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadMore()}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
