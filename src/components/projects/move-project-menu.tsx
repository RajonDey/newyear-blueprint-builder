"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeft, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Tiny "Move to area…" affordance for the project detail header.
 *
 * Renders next to the area breadcrumb. Posts a `PATCH /api/projects/:id` with
 * the new `areaId` (or `null` for "detach"), then refreshes so the
 * breadcrumb, area page, and dashboard all see the new anchor.
 */
interface MoveProjectMenuProps {
  projectId: string
  currentAreaId: string | null
  areas: { id: string; name: string }[]
}

export function MoveProjectMenu({
  projectId,
  currentAreaId,
  areas,
}: MoveProjectMenuProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)

  async function moveTo(areaId: string | null) {
    if (areaId === currentAreaId) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        toast.error(body?.error || "Could not move project.")
        return
      }
      toast.success(areaId ? "Project moved" : "Project detached from area")
      startTransition(() => router.refresh())
    } catch {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  if (areas.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ArrowRightLeft className="h-3 w-3" />
          )}
          Move
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Move to area
        </DropdownMenuLabel>
        {areas.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onSelect={() => moveTo(a.id)}
            className="gap-2"
          >
            {a.id === currentAreaId ? (
              <Check className="h-3.5 w-3.5 text-amber" />
            ) : (
              <span className="h-3.5 w-3.5" />
            )}
            <span className="truncate">{a.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => moveTo(null)}
          className="gap-2 text-muted-foreground"
        >
          {currentAreaId === null ? (
            <Check className="h-3.5 w-3.5 text-amber" />
          ) : (
            <span className="h-3.5 w-3.5" />
          )}
          No area
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
