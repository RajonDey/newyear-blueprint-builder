"use client"

/* Hallmark · design-system: design.md · designed-as-app */

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Lock, Plus } from "lucide-react"
import { toast } from "sonner"
import type { LifeCategory } from "@prisma/client"
import { AreaCard } from "@/components/areas/area-card"
import { AreaActions } from "@/components/areas/area-actions"
import type { AreaWithSummary } from "@/lib/queries/areas"
import { lifeCategoryLabels, lifeCategoryOrder } from "@/lib/level-styles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setAdding((v) => !v)}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" /> New area
          {!isPro && <Lock className="h-3 w-3 text-amber" />}
        </Button>
      </div>

      {adding && (
        <section className="border border-border p-4">
          <p className="text-xs text-muted-foreground mb-3">
            New area {!isPro && "· requires Pro"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add()
                if (e.key === "Escape") setAdding(false)
              }}
              placeholder="Area name (e.g. Craft, Family)"
              className="flex-1 min-w-[200px]"
            />
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as LifeCategory)}
            >
              <SelectTrigger className="w-[160px]" title="Visual family (color + icon)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lifeCategoryOrder.map((c) => (
                  <SelectItem key={c} value={c}>
                    {lifeCategoryLabels[c]} style
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={add}
              disabled={!name.trim() || submitting || !isPro}
            >
              {submitting ? "Adding…" : "Add"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
            >
              Cancel
            </Button>
          </div>
          {!isPro && (
            <p className="mt-2 text-xs text-muted-foreground">
              Free includes the six default areas. Custom areas unlock with Pro.
            </p>
          )}
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
