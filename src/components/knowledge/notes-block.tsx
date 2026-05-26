"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Embedded notes block — workbench section, status tokens (Wave D4).
 */

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Check, Pencil, Pin, PinOff, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { ParentType } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import type { NoteRow } from "@/lib/queries/notes"
import {
  KNOWLEDGE_VIEW_ALL_THRESHOLD,
  knowledgeNotesHref,
} from "@/lib/knowledge/index-links"

interface NotesBlockProps {
  parentType: ParentType
  parentId: string
  initial: NoteRow[]
  /** Optional header — falls back to "Notes" if omitted. */
  title?: string
  /** Heading description. */
  description?: string
  /** Render variant: `card` (default, used on Area / Project pages) or `flat` for embedded contexts. */
  variant?: "card" | "flat"
  /** When false, hides the block title row (accordion parent supplies the label). */
  showHeader?: boolean
  /** Filtered knowledge index link — shown when note count exceeds preview threshold. */
  viewAllHref?: string
}

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Polymorphic Notes block — drop on any PARA surface by passing `parentType`
 * and `parentId`. Notes are owned by the user; the API enforces parent
 * ownership and per-tier `maxNotes` quota.
 *
 * UI: textarea with inline add, list with pinned-first ordering, hover-only
 * delete + pin toggle on each row.
 */
export function NotesBlock({
  parentType,
  parentId,
  initial,
  title = "Notes",
  description,
  variant = "card",
  showHeader = true,
  viewAllHref,
}: NotesBlockProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [notes, setNotes] = useState<NoteRow[]>(initial)
  const [draft, setDraft] = useState("")
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState("")

  async function add() {
    const text = draft.trim()
    if (!text || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentType, parentId, content: text }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not save note.")
        return
      }
      setNotes((prev) =>
        [body.data as NoteRow, ...prev].sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }),
      )
      setDraft("")
      setOpen(false)
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  async function togglePin(note: NoteRow) {
    const next = !note.pinned
    setNotes((prev) =>
      [...prev.map((n) => (n.id === note.id ? { ...n, pinned: next } : n))].sort(
        (a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        },
      ),
    )
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: next }),
      })
      if (!res.ok) {
        setNotes((prev) =>
          prev.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n)),
        )
        toast.error("Could not update.")
      }
    } catch {
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? { ...n, pinned: note.pinned } : n)),
      )
      toast.error("Network error.")
    }
  }

  async function remove(note: NoteRow) {
    setNotes((prev) => prev.filter((n) => n.id !== note.id))
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" })
      if (!res.ok) {
        setNotes((prev) => [...prev, note])
        toast.error("Could not delete note.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setNotes((prev) => [...prev, note])
      toast.error("Network error.")
    }
  }

  function startEdit(note: NoteRow) {
    setEditingId(note.id)
    setEditDraft(note.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditDraft("")
  }

  async function saveEdit(note: NoteRow) {
    const next = editDraft.trim()
    if (!next || next === note.content) {
      cancelEdit()
      return
    }
    const prev = note.content
    setNotes((curr) =>
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
        setNotes((curr) =>
          curr.map((n) => (n.id === note.id ? { ...n, content: prev } : n)),
        )
        toast.error("Could not save note.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setNotes((curr) =>
        curr.map((n) => (n.id === note.id ? { ...n, content: prev } : n)),
      )
      toast.error("Network error.")
    }
  }

  return (
    <section
      className={cn(
        variant === "card" && "border border-border p-6",
      )}
    >
      <div className="mb-4 flex items-baseline justify-between gap-3">
        {showHeader ? (
          <div>
            <h2 className="font-display text-xl tracking-tight">{title}</h2>
            {description ? (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-0.5">
                Capture context, decisions, and reflections.
              </p>
            )}
          </div>
        ) : (
          <div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        )}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-3 w-3" /> Add note
          </button>
        )}
      </div>

      {open && (
        <div className="mb-4 space-y-2 rounded-lg border border-dashed border-border/70 p-3 bg-background/40">
          <Textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                add()
              }
              if (e.key === "Escape") {
                setOpen(false)
                setDraft("")
              }
            }}
            placeholder="What's worth remembering?"
            className="min-h-[80px] resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">⌘Enter to save · Esc to cancel</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setOpen(false)
                  setDraft("")
                }}
                className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={add}
                disabled={!draft.trim() || submitting}
                className="rounded-md bg-foreground text-background px-3 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No notes yet. Jot down the first idea or decision worth remembering — or
          browse everything in{" "}
          <Link
            href={viewAllHref ?? knowledgeNotesHref()}
            className="text-foreground not-italic hover:text-amber transition-colors"
          >
            all notes
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              id={`note-${n.id}`}
              className={cn(
                "group rounded-lg border border-border/70 p-3 text-sm bg-background/40 transition-colors scroll-mt-24",
                n.pinned && "border-amber/40 bg-amber-tint",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
                    {n.pinned && (
                      <span className="inline-flex items-center gap-1 text-amber">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                    <span>{formatDate(n.createdAt)}</span>
                  </div>
                  {editingId === n.id ? (
                    <Textarea
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault()
                          saveEdit(n)
                        }
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="min-h-[80px] resize-none text-sm"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{n.content}</p>
                  )}
                </div>
                {editingId === n.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => saveEdit(n)}
                      aria-label="Save note"
                      className="rounded p-1 text-status-positive hover:bg-status-positive/10 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      aria-label="Cancel edit"
                      className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => startEdit(n)}
                      aria-label="Edit note"
                      className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => togglePin(n)}
                      aria-label={n.pinned ? "Unpin note" : "Pin note"}
                      className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {n.pinned ? (
                        <PinOff className="h-3.5 w-3.5" />
                      ) : (
                        <Pin className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => remove(n)}
                      aria-label="Delete note"
                      className="rounded p-1 text-muted-foreground hover:text-status-risk transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {notes.length > KNOWLEDGE_VIEW_ALL_THRESHOLD && viewAllHref ? (
        <div className="mt-4 pt-3 border-t border-border/60">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all {notes.length} notes
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </section>
  )
}
