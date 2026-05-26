"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Lock, Plus } from "lucide-react"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"
import { AreaCard } from "@/components/areas/area-card"
import { AreaActions } from "@/components/areas/area-actions"
import type { AreaWithSummary } from "@/lib/queries/areas"
import { lifeCategoryLabels, lifeCategoryOrder } from "@/lib/level-styles"

interface AreasGridProps {
  areas: AreaWithSummary[]
  isPro: boolean
}

export function AreasGrid({ areas, isPro }: AreasGridProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<LifeCategory>("HEALTH")
  const [submitting, setSubmitting] = useState(false)

  async function add() {
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    if (!isPro) {
      toast.message("Custom areas unlock with Pro", {
        description: "Free plans include the six default areas.",
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, category }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(body?.message || body?.error || "Could not create area.")
        return
      }
      setName("")
      setAdding(false)
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-start justify-end -mt-2">
        <button
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> New area
          {!isPro && <Lock className="h-3 w-3 text-amber" />}
        </button>
      </div>

      {adding && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            New area {!isPro && "· requires Pro"}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add()
                if (e.key === "Escape") setAdding(false)
              }}
              placeholder="Area name (e.g. Craft, Family)"
              className="flex-1 min-w-[200px] rounded-lg border border-border bg-background/60 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as LifeCategory)}
              className="rounded-lg border border-border bg-background/60 px-2 py-1.5 text-sm"
              title="Visual family (color + icon)"
            >
              {lifeCategoryOrder.map((c) => (
                <option key={c} value={c}>
                  {lifeCategoryLabels[c]} style
                </option>
              ))}
            </select>
            <button
              onClick={add}
              disabled={!name.trim() || submitting || !isPro}
              className="rounded-lg bg-foreground text-background px-3 py-1.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          {!isPro && (
            <p className="mt-2 text-xs text-muted-foreground">
              Free includes the six default areas. Custom areas unlock with Pro.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <AreaCard
            key={area.id}
            id={area.id}
            name={area.name}
            category={area.category}
            projectCount={area.projectCount}
            onTrackCount={area.onTrackCount}
            noteCount={area.noteCount}
            topProjects={area.topProjects}
            moreProjects={area.moreProjects}
            health={area.health}
            actions={
              <AreaActions
                area={{
                  id: area.id,
                  name: area.name,
                  description: area.description,
                  category: area.category,
                  isDefault: area.isDefault,
                }}
                orderedIds={areas.map((a) => a.id)}
                isPro={isPro}
              />
            }
          />
        ))}
      </div>
    </>
  )
}
