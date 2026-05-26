"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Embedded resources block — workbench section, silent upload (Wave D4).
 */

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowUpRight,
  Check,
  ExternalLink,
  File as FileIcon,
  FileImage,
  FileText,
  Link as LinkIcon,
  Lock,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import type { ParentType, ResourceKind } from "@prisma/client"
import { cn } from "@/lib/utils"
import type { ResourceRow } from "@/lib/queries/resources"
import {
  KNOWLEDGE_VIEW_ALL_THRESHOLD,
  knowledgeResourcesHref,
} from "@/lib/knowledge/index-links"

interface ResourcesBlockProps {
  parentType: ParentType
  parentId: string
  initial: ResourceRow[]
  /** Pro tier can upload files; Free tier sees a calm upsell. */
  canUploadFiles: boolean
  /** Per-file cap in bytes (for client-side guard before posting). */
  maxFileBytes: number
  title?: string
  description?: string
  variant?: "card" | "flat"
  showHeader?: boolean
  viewAllHref?: string
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

/**
 * Polymorphic Resources block — links for everyone, file uploads for Pro.
 *
 * Free users see a "Pro · Upload" affordance that opens an upgrade card
 * inline (no Vercel Blob write is attempted — protects unit economics).
 */
export function ResourcesBlock({
  parentType,
  parentId,
  initial,
  canUploadFiles,
  maxFileBytes,
  title = "Resources",
  description,
  variant = "card",
  showHeader = true,
  viewAllHref,
}: ResourcesBlockProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [items, setItems] = useState<ResourceRow[]>(initial)
  const [mode, setMode] = useState<"closed" | "link" | "upsell">("closed")
  const [linkTitle, setLinkTitle] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const fileInput = useRef<HTMLInputElement>(null)

  async function addLink() {
    const t = linkTitle.trim()
    const u = linkUrl.trim()
    if (!t || !u || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentType, parentId, title: t, url: u }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not save link.")
        return
      }
      setItems((prev) => [body.data as ResourceRow, ...prev])
      setLinkTitle("")
      setLinkUrl("")
      setMode("closed")
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  async function uploadFile(file: File) {
    if (file.size > maxFileBytes) {
      const mb = Math.round(maxFileBytes / (1024 * 1024))
      toast.error(`File exceeds the ${mb} MB per-file cap.`)
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.set("file", file)
      form.set("parentType", parentType)
      form.set("parentId", parentId)
      const res = await fetch("/api/resources/upload", {
        method: "POST",
        body: form,
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Upload failed.")
        return
      }
      setItems((prev) => [body.data as ResourceRow, ...prev])
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error.")
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  async function remove(row: ResourceRow) {
    setItems((prev) => prev.filter((r) => r.id !== row.id))
    try {
      const res = await fetch(`/api/resources/${row.id}`, { method: "DELETE" })
      if (!res.ok) {
        setItems((prev) => [...prev, row])
        toast.error("Could not delete resource.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((prev) => [...prev, row])
      toast.error("Network error.")
    }
  }

  function startEdit(row: ResourceRow) {
    setEditingId(row.id)
    setEditTitle(row.title)
    setEditUrl(row.url)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle("")
    setEditUrl("")
  }

  async function saveEdit(row: ResourceRow) {
    const nextTitle = editTitle.trim()
    const nextUrl = editUrl.trim()
    if (!nextTitle || !nextUrl) {
      toast.error("Title and URL are required.")
      return
    }
    if (nextTitle === row.title && nextUrl === row.url) {
      cancelEdit()
      return
    }
    const prev = row
    setItems((curr) =>
      curr.map((r) =>
        r.id === row.id ? { ...r, title: nextTitle, url: nextUrl } : r,
      ),
    )
    setEditingId(null)
    try {
      const res = await fetch(`/api/resources/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, url: nextUrl }),
      })
      if (!res.ok) {
        setItems((curr) => curr.map((r) => (r.id === row.id ? prev : r)))
        const body = await res.json().catch(() => null)
        toast.error(body?.message || body?.error || "Could not save link.")
        return
      }
      startTransition(() => router.refresh())
    } catch {
      setItems((curr) => curr.map((r) => (r.id === row.id ? prev : r)))
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
                Links, references, and files that support this work.
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("link")}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-3 w-3" /> Add link
          </button>
          {canUploadFiles ? (
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Upload className="h-3 w-3" /> {uploading ? "Uploading…" : "Upload"}
            </button>
          ) : (
            <button
              onClick={() => setMode("upsell")}
              className="inline-flex items-center gap-1 rounded-md border border-amber/40 bg-amber/[0.06] px-2.5 py-1 text-xs text-amber hover:bg-amber/[0.12] transition-colors"
            >
              <Lock className="h-3 w-3" /> Pro · Upload
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) uploadFile(f)
        }}
      />

      {mode === "upsell" && (
        <div className="mb-4 border border-amber/40 bg-amber-tint p-5">
          <div className="text-xs font-medium text-amber mb-2">Pro · File uploads</div>
          <h3 className="font-display text-lg leading-snug">
            Attach PDFs, images, and docs to any project
          </h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Pro gives you 2 GB of file storage with a 25 MB-per-file cap, plus
            unlimited links. Free stays link-only.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href="/pricing"
              className="rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro
            </Link>
            <button
              onClick={() => setMode("closed")}
              className="rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {mode === "link" && (
        <div className="mb-4 space-y-2 rounded-lg border border-dashed border-border/70 p-3 bg-background/40">
          <input
            autoFocus
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            type="url"
            className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
            onKeyDown={(e) => {
              if (e.key === "Enter") addLink()
              if (e.key === "Escape") setMode("closed")
            }}
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setMode("closed")}
              className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addLink}
              disabled={!linkTitle.trim() || !linkUrl.trim() || submitting}
              className="rounded-md bg-foreground text-background px-3 py-1 text-xs font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {submitting ? "Saving…" : "Save link"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No resources yet.{" "}
          {canUploadFiles
            ? "Drop a link or upload a file — or browse "
            : "Add a link above, or browse "}
          <Link
            href={viewAllHref ?? knowledgeResourcesHref()}
            className="text-foreground not-italic hover:text-amber transition-colors"
          >
            all resources
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r) => {
            const Icon = iconFor(r.kind, r.mimeType)
            const size = formatBytes(r.sizeBytes)
            const editable = r.kind === "LINK"
            const isEditing = editingId === r.id
            return (
              <li
                key={r.id}
                className="group rounded-lg border border-border/70 p-2.5 text-sm bg-background/40 hover:bg-background/70 transition-colors"
              >
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
                        if (e.key === "Enter") saveEdit(r)
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="w-full rounded-md border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
                    />
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={cancelEdit}
                        aria-label="Cancel edit"
                        className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => saveEdit(r)}
                        aria-label="Save link"
                        className="rounded p-1 text-status-positive hover:bg-status-positive/10 transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-0 inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <span className="truncate">{r.title}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                    </a>
                    {size && (
                      <span className="text-[11px] text-muted-foreground/80 shrink-0 tabular-nums">
                        {size}
                      </span>
                    )}
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {editable && (
                        <button
                          onClick={() => startEdit(r)}
                          aria-label="Edit link"
                          className="rounded p-1 text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => remove(r)}
                        aria-label="Remove resource"
                        className="rounded p-1 text-muted-foreground/40 hover:text-status-risk transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {items.length > KNOWLEDGE_VIEW_ALL_THRESHOLD && viewAllHref ? (
        <div className="mt-4 pt-3 border-t border-border/60">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all {items.length} resources
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}
    </section>
  )
}
