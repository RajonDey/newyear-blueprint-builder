"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ImageIcon,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Quote,
  Sparkles,
  Star,
  Trash2,
  Trophy,
} from "lucide-react"
import { toast } from "sonner"
import type { VisionItem, VisionItemKind } from "@prisma/client"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/atmosphere/eyebrow"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import type { LinkedProjectChip } from "@/lib/queries/vision-projects"

interface VisionBoardProps {
  northStar: string | null
  items: VisionItem[]
  linkedProjectsByItemId: Record<string, LinkedProjectChip[]>
  cap: number
  isPro: boolean
}

const KIND_META: Record<
  VisionItemKind,
  { label: string; icon: typeof Sparkles; tone: string }
> = {
  STATEMENT: { label: "Statement", icon: Sparkles, tone: "text-amber" },
  VALUE: { label: "Value", icon: Star, tone: "text-amber" },
  MILESTONE: { label: "Milestone", icon: Trophy, tone: "text-emerald-600" },
  IMAGE: { label: "Image", icon: ImageIcon, tone: "text-sky-600" },
  QUOTE: { label: "Quote", icon: Quote, tone: "text-rose-600" },
}

const STARTER_PROMPTS: { kind: VisionItemKind; title: string; body: string }[] = [
  {
    kind: "STATEMENT",
    title: "Who are you becoming?",
    body: "A single sentence about the person you're walking toward.",
  },
  {
    kind: "VALUE",
    title: "What do you refuse to trade away?",
    body: "The non-negotiable that holds the whole shape together.",
  },
  {
    kind: "MILESTONE",
    title: "One milestone that would mean everything.",
    body: "Specific enough to know when you've reached it.",
  },
  {
    kind: "QUOTE",
    title: "A quote that points at the life you want.",
    body: "Borrowed words you keep returning to.",
  },
]

export function VisionBoard({
  northStar,
  items,
  linkedProjectsByItemId,
  cap,
  isPro,
}: VisionBoardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <>
      <NorthStarBlock initial={northStar} />

      {items.length === 0 ? (
        <EmptyState
          isPro={isPro}
          cap={cap}
          onCreated={() => startTransition(() => router.refresh())}
        />
      ) : (
        <VisionItemsGrid
          items={items}
          linkedProjectsByItemId={linkedProjectsByItemId}
          cap={cap}
          isPro={isPro}
          onChange={() => startTransition(() => router.refresh())}
        />
      )}
    </>
  )
}

/* ----------------------------- North Star ----------------------------- */

function NorthStarBlock({ initial }: { initial: string | null }) {
  const [value, setValue] = useState(initial ?? "")
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef(initial ?? "")

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function scheduleSave(next: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (next === lastSavedRef.current) return
      try {
        const res = await fetch("/api/vision", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ northStar: next.trim() || null }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          toast.error(body?.error || "Could not save.")
          return
        }
        lastSavedRef.current = next
        setSavedAt(new Date())
      } catch {
        toast.error("Network error. Please try again.")
      }
    }, 800)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <Eyebrow className="mb-2">North star</Eyebrow>
      <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-3">
        Who are you becoming?
      </h2>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          scheduleSave(e.target.value)
        }}
        rows={3}
        placeholder="A single sentence about the person you're walking toward. (Autosaves.)"
        className="w-full resize-none bg-transparent text-base md:text-lg leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
      />
      <div className="mt-2 text-[11px] text-muted-foreground">
        {savedAt
          ? `Saved · ${savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
          : "Autosaves as you type."}
      </div>
    </section>
  )
}

/* ----------------------------- Empty state ----------------------------- */

function EmptyState({
  isPro,
  cap,
  onCreated,
}: {
  isPro: boolean
  cap: number
  onCreated: () => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <Eyebrow className="mb-2">Vision board</Eyebrow>
      <h2 className="font-display text-2xl md:text-3xl tracking-tight">
        Start with a few cards
      </h2>
      <p className="text-muted-foreground mt-2 max-w-xl leading-relaxed">
        Each card is a small commitment to who you&apos;re becoming. Statement, value,
        milestone, quote — pick one and start.
      </p>
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        {STARTER_PROMPTS.map((p) => (
          <NewItemTrigger
            key={p.title}
            isPro={isPro}
            cap={cap}
            preset={p}
            onCreated={onCreated}
            label={p.title}
          />
        ))}
      </div>
    </section>
  )
}

function NewItemTrigger({
  isPro,
  cap,
  preset,
  onCreated,
  label,
}: {
  isPro: boolean
  cap: number
  preset: { kind: VisionItemKind; title: string; body: string }
  onCreated: () => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left rounded-xl border border-dashed border-border bg-background/40 px-4 py-3 hover:bg-background hover:border-amber/40 transition-colors"
      >
        <div className="text-[10px] uppercase tracking-widest text-amber mb-1">
          {KIND_META[preset.kind].label}
        </div>
        <div className="text-sm font-medium leading-snug">{label}</div>
        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {preset.body}
        </div>
      </button>
      {open && (
        <ItemDialog
          mode="create"
          initial={{
            kind: preset.kind,
            title: "",
            body: "",
            imageUrl: null,
          }}
          isPro={isPro}
          cap={cap}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false)
            onCreated()
          }}
        />
      )}
    </>
  )
}

/* ----------------------------- Items grid ----------------------------- */

function VisionItemsGrid({
  items,
  linkedProjectsByItemId,
  cap,
  isPro,
  onChange,
}: {
  items: VisionItem[]
  linkedProjectsByItemId: Record<string, LinkedProjectChip[]>
  cap: number
  isPro: boolean
  onChange: () => void
}) {
  const [creating, setCreating] = useState(false)
  const atCap = items.length >= cap

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow className="mb-2">Vision board</Eyebrow>
          <h2 className="font-display text-2xl tracking-tight">
            Cards on your board
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {items.length} / {cap} cards
          </span>
          <button
            onClick={() => setCreating(true)}
            disabled={atCap}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New card
            {atCap && !isPro && <Lock className="h-3 w-3 text-amber" />}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <VisionCard
            key={item.id}
            item={item}
            linkedProjects={linkedProjectsByItemId[item.id] ?? []}
            orderedIds={items.map((i) => i.id)}
            onChange={onChange}
          />
        ))}
      </div>

      {atCap && !isPro && (
        <div className="rounded-2xl border border-amber/40 bg-amber/[0.06] p-5 text-sm">
          <div className="font-medium">You&apos;re at the Free cap of {cap} cards.</div>
          <p className="text-muted-foreground mt-1">
            Pro lifts this to 50 cards plus images and Area anchors.
          </p>
          <Button asChild size="sm" className="mt-3 gap-2">
            <a href="/pricing">Upgrade to Pro</a>
          </Button>
        </div>
      )}

      {creating && (
        <ItemDialog
          mode="create"
          initial={{ kind: "STATEMENT", title: "", body: "", imageUrl: null }}
          isPro={isPro}
          cap={cap}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false)
            onChange()
          }}
        />
      )}
    </section>
  )
}

function VisionCard({
  item,
  linkedProjects,
  orderedIds,
  onChange,
}: {
  item: VisionItem
  linkedProjects: LinkedProjectChip[]
  orderedIds: string[]
  onChange: () => void
}) {
  const [editing, setEditing] = useState(false)
  const meta = KIND_META[item.kind]
  const Icon = meta.icon

  const idx = orderedIds.indexOf(item.id)
  const isFirst = idx <= 0
  const isLast = idx === -1 || idx >= orderedIds.length - 1

  async function destroy() {
    if (!confirm("Delete this card?")) return
    const res = await fetch(`/api/vision/items/${item.id}`, { method: "DELETE" })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      toast.error(body?.error || "Could not delete.")
      return
    }
    onChange()
  }

  async function toggleAchieved() {
    const res = await fetch(`/api/vision/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievedAt: item.achievedAt ? null : "now" }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      toast.error(body?.error || "Could not update.")
      return
    }
    onChange()
  }

  async function move(direction: "up" | "down") {
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= orderedIds.length) return
    const reordered = [...orderedIds]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    const res = await fetch("/api/vision/items/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemIds: reordered }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      toast.error(body?.error || "Could not reorder.")
      return
    }
    onChange()
  }

  return (
    <article
      className={cn(
        "group rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-card/80",
        item.achievedAt && "opacity-80",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <Icon className={cn("h-3.5 w-3.5", meta.tone)} />
          {meta.label}
          {item.achievedAt && (
            <span className="ml-2 inline-flex items-center gap-1 text-emerald-600 normal-case tracking-normal">
              <CheckCircle2 className="h-3 w-3" />
              Achieved
            </span>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Card actions"
              className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2" onSelect={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            {item.kind === "MILESTONE" && (
              <DropdownMenuItem className="gap-2" onSelect={toggleAchieved}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                {item.achievedAt ? "Mark unachieved" : "Mark achieved"}
              </DropdownMenuItem>
            )}
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
      </div>

      <h3 className="font-display text-lg leading-snug tracking-tight">
        {item.title}
      </h3>
      {item.body && (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-wrap">
          {item.body}
        </p>
      )}
      {item.imageUrl && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="w-full max-h-48 object-cover"
          />
        </div>
      )}

      {linkedProjects.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/60">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {linkedProjects.length === 1
              ? "1 active project"
              : `${linkedProjects.length} active projects`}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {linkedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="inline-flex max-w-full items-center rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:border-amber/40 transition-colors truncate"
              >
                {project.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <ItemDialog
          mode="edit"
          itemId={item.id}
          initial={{
            kind: item.kind,
            title: item.title,
            body: item.body ?? "",
            imageUrl: item.imageUrl ?? null,
          }}
          isPro
          cap={Number.POSITIVE_INFINITY}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            onChange()
          }}
        />
      )}
    </article>
  )
}

/* ----------------------------- Dialog ----------------------------- */

function ItemDialog({
  mode,
  itemId,
  initial,
  isPro,
  cap,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit"
  itemId?: string
  initial: {
    kind: VisionItemKind
    title: string
    body: string
    imageUrl: string | null
  }
  isPro: boolean
  cap: number
  onClose: () => void
  onSaved: () => void
}) {
  const [kind, setKind] = useState<VisionItemKind>(initial.kind)
  const [title, setTitle] = useState(initial.title)
  const [body, setBody] = useState(initial.body)
  const [imageUrl, setImageUrl] = useState<string>(initial.imageUrl ?? "")
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || submitting) return
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        kind,
        title: title.trim(),
        body: body.trim() || undefined,
      }
      if (kind === "IMAGE") {
        if (!imageUrl.trim()) {
          toast.error("Image URL is required for image cards.")
          setSubmitting(false)
          return
        }
        payload.imageUrl = imageUrl.trim()
      }
      const res =
        mode === "create"
          ? await fetch("/api/vision/items", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/vision/items/${itemId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.message || data?.error || "Could not save.")
        return
      }
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-foreground/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
      >
        <div>
          <Eyebrow>{mode === "create" ? "New card" : "Edit card"}</Eyebrow>
          <h3 className="font-display text-xl tracking-tight mt-1">
            Shape this card
          </h3>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Kind
            </span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as VisionItemKind)}
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm"
            >
              {(Object.keys(KIND_META) as VisionItemKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_META[k].label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Title
            </span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="A short, declarative line."
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Body (optional)
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="More context, the why behind it, what it would feel like."
              className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
          </label>

          {kind === "IMAGE" && (
            <label className="block">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Image URL
              </span>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="mt-1 w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
              <span className="mt-1 block text-[11px] text-muted-foreground">
                Paste any public image URL. File uploads land in Phase 5 for Pro.
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? "Saving…" : mode === "create" ? "Add card" : "Save"}
          </Button>
        </div>

        {!isPro && mode === "create" && (
          <p className="text-[11px] text-muted-foreground">
            Free plans cap the board at {cap} cards.
          </p>
        )}
      </form>
    </div>
  )
}
