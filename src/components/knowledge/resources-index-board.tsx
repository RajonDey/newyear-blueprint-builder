"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Knowledge resources index — divided list, status tokens (Wave D4).
 */

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  ExternalLink,
  File as FileIcon,
  FileImage,
  FileText,
  Link as LinkIcon,
  Pencil,
  Trash2,
  X,
} from "lucide-react"
import { toast } from "sonner"
import type { ResourceKind } from "@prisma/client"
import { Button } from "@/components/ui/button"
import type { ResourceIndexRow } from "@/lib/queries/knowledge-index"
import { KnowledgeIndexFilters } from "./knowledge-index-filters"

function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatBytes(bytes: number | null): string | null {
  if (!bytes || bytes < 0) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function iconFor(kind: ResourceKind, mime: string | null) {
  if (kind === "LINK") return LinkIcon
  if (!mime) return FileIcon
  if (mime.startsWith("image/")) return FileImage
  if (mime.startsWith("text/") || mime.includes("pdf")) return FileText
  return FileIcon
}

export function ResourcesIndexBoard({
  initialItems,
  initialCursor,
  total,
  areas,
  filters,
}: {
  initialItems: ResourceIndexRow[]
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
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")

  async function loadMore() {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const params = new URLSearchParams({ cursor, limit: "20" })
      if (filters.parentType) params.set("parentType", filters.parentType)
      if (filters.areaId) params.set("areaId", filters.areaId)
      const res = await fetch(`/api/knowledge/resources?${params}`)
      const body = await res.json().catch(() => null)
      if (!res.ok || !body?.data) {
        toast.error("Could not load more resources.")
        return
      }
      setItems((prev) => [...prev, ...(body.data.items as ResourceIndexRow[])])
      setCursor(body.data.nextCursor ?? null)
    } finally {
      setLoadingMore(false)
    }
  }

  function startEdit(row: ResourceIndexRow) {
    if (row.kind !== "LINK") return
    setEditingId(row.id)
    setEditTitle(row.title)
    setEditUrl(row.url)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle("")
    setEditUrl("")
  }

  async function saveEdit(row: ResourceIndexRow) {
    const title = editTitle.trim()
    const url = editUrl.trim()
    if (!title || !url) return
    if (title === row.title && url === row.url) {
      cancelEdit()
      return
    }
    const prev = { title: row.title, url: row.url }
    setItems((curr) =>
      curr.map((r) => (r.id === row.id ? { ...r, title, url } : r)),
    )
    setEditingId(null)
    try {
      const res = await fetch(`/api/resources/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      })
      if (!res.ok) {
        setItems((curr) =>
          curr.map((r) =>
            r.id === row.id ? { ...r, title: prev.title, url: prev.url } : r,
          ),
        )
        const body = await res.json().catch(() => null)
        toast.error(body?.message || body?.error || "Could not save link.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) =>
        curr.map((r) =>
          r.id === row.id ? { ...r, title: prev.title, url: prev.url } : r,
        ),
      )
      toast.error("Network error.")
    }
  }

  async function remove(row: ResourceIndexRow) {
    setItems((curr) => curr.filter((r) => r.id !== row.id))
    try {
      const res = await fetch(`/api/resources/${row.id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems((curr) => [...curr, row])
        toast.error("Could not delete resource.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) => [...curr, row])
      toast.error("Network error.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <KnowledgeIndexFilters areas={areas} basePath="/knowledge/resources" />
        <p className="text-xs text-muted-foreground tabular-nums">
          {total} resource{total !== 1 ? "s" : ""}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No resources match these filters. Links and files attach to areas and
            projects — add them from any detail page.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {items.map((row) => {
            const Icon = iconFor(row.kind, row.mimeType)
            const size = formatBytes(row.sizeBytes)
            const editable = row.kind === "LINK"
            const isEditing = editingId === row.id

            return (
              <li
                key={row.id}
                className="group py-4 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={row.parentHref}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                      {row.parent.areaName ? (
                        <>
                          <span>{row.parent.areaName}</span>
                          <ChevronRight className="h-2.5 w-2.5" />
                        </>
                      ) : null}
                      <span>{row.parent.label}</span>
                      <ArrowUpRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>

                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                          className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
                        />
                        <input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="https://…"
                          type="url"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveEdit(row)
                            if (e.key === "Escape") cancelEdit()
                          }}
                          className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
                        />
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm hover:text-amber transition-colors truncate block"
                          >
                            {row.title}
                          </a>
                          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                            {row.kind === "FILE" ? size ?? "File" : row.url}
                            {" · "}
                            {formatDate(row.createdAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void saveEdit(row)}
                          aria-label="Save link"
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
                          href={row.parentHref}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                          aria-label="Open parent"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        {editable ? (
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            aria-label="Edit link"
                            className="rounded p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => void remove(row)}
                          aria-label="Delete resource"
                          className="rounded p-1 text-muted-foreground hover:text-status-risk"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
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
