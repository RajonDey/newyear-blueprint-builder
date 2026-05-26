"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowDown,
  ArrowUp,
  Lock,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"
import { lifeCategoryLabels, lifeCategoryOrder } from "@/lib/level-styles"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Per-card action menu for an Area: Edit · Move up · Move down · Delete.
 *
 * Rendered as an absolutely-positioned island on top of the AreaCard `<Link>`
 * so the click on the menu trigger doesn't propagate to the link wrapper.
 *
 * Free-tier users can rename / recolor / re-describe their six defaults but
 * can't change `category` or `isDefault` (the API enforces this); the dialog
 * mirrors that by disabling the category select for non-Pro users.
 */
interface AreaActionsProps {
  area: {
    id: string
    name: string
    description: string | null
    category: LifeCategory | null
    isDefault: boolean
  }
  /** Ordered list of all area IDs as currently rendered, used for reorder. */
  orderedIds: string[]
  isPro: boolean
}

export function AreaActions({ area, orderedIds, isPro }: AreaActionsProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(area.name)
  const [description, setDescription] = useState(area.description ?? "")
  const [category, setCategory] = useState<LifeCategory | "NONE">(
    area.category ?? "NONE",
  )
  const [submitting, setSubmitting] = useState(false)

  function refresh() {
    startTransition(() => router.refresh())
  }

  async function saveEdit() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Area name can't be empty.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/areas/${area.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim() || null,
          // Category is Pro-only; the API drops it silently for Free users.
          category: category === "NONE" ? null : category,
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not save area.")
        return
      }
      setEditing(false)
      refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const idx = orderedIds.indexOf(area.id)
  const isFirst = idx <= 0
  const isLast = idx === -1 || idx >= orderedIds.length - 1

  async function move(direction: "up" | "down") {
    if (idx === -1) return
    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= orderedIds.length) return
    const reordered = [...orderedIds]
    ;[reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]]
    try {
      const moveRes = await fetch("/api/areas/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaIds: reordered }),
      })
      if (!moveRes.ok) {
        toast.error("Could not reorder.")
        return
      }
      refresh()
    } catch {
      toast.error("Network error.")
    }
  }

  async function destroy() {
    if (area.isDefault) {
      toast.error("Default areas can't be deleted. Rename it instead.")
      return
    }
    if (
      !confirm(
        `Delete "${area.name}"? Projects inside this area stay but lose their anchor.`,
      )
    ) {
      return
    }
    try {
      const res = await fetch(`/api/areas/${area.id}`, { method: "DELETE" })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not delete.")
        return
      }
      refresh()
    } catch {
      toast.error("Network error.")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Area actions"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
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
            onSelect={(e) => {
              e.preventDefault()
              setEditing(true)
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </DropdownMenuItem>
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
            disabled={area.isDefault}
            onSelect={destroy}
            className="gap-2 text-destructive focus:text-destructive"
          >
            {area.isDefault ? (
              <>
                <Lock className="h-3.5 w-3.5" /> Default (can&apos;t delete)
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editing} onOpenChange={(o) => setEditing(o)}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="font-display">Edit area</DialogTitle>
            <DialogDescription>
              Rename, reword, or change the visual family. Projects inside this
              area keep their place.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                placeholder="Area name"
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What this area is about, who you want to be in it."
                rows={3}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Visual family {!isPro && "· Pro only"}
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as LifeCategory | "NONE")
                }
                disabled={!isPro}
                className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="NONE">No family</option>
                {lifeCategoryOrder.map((c) => (
                  <option key={c} value={c}>
                    {lifeCategoryLabels[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!name.trim() || submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
