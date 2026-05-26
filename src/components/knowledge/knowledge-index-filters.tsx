"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { ParentType } from "@prisma/client"

const PARENT_TYPE_OPTIONS: { value: ParentType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All parents" },
  { value: "AREA", label: "Areas" },
  { value: "PROJECT", label: "Projects" },
  { value: "VISION", label: "Vision" },
  { value: "VISION_ITEM", label: "Vision items" },
  { value: "TASK", label: "Tasks" },
  { value: "SYSTEM", label: "Systems" },
]

export function KnowledgeIndexFilters({
  areas,
  basePath,
}: {
  areas: { id: string; name: string }[]
  basePath: "/knowledge/notes" | "/knowledge/resources"
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentType = (searchParams.get("parentType") as ParentType | "ALL" | null) ?? "ALL"
  const areaId = searchParams.get("areaId") ?? "ALL"

  function update(next: { parentType?: string; areaId?: string }) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("cursor")
    if (next.parentType !== undefined) {
      if (next.parentType === "ALL") params.delete("parentType")
      else params.set("parentType", next.parentType)
    }
    if (next.areaId !== undefined) {
      if (next.areaId === "ALL") params.delete("areaId")
      else params.set("areaId", next.areaId)
    }
    const q = params.toString()
    router.push(q ? `${basePath}?${q}` : basePath)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={parentType}
        onChange={(e) => update({ parentType: e.target.value })}
        className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs"
        aria-label="Filter by parent type"
      >
        {PARENT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {areas.length > 0 && (
        <select
          value={areaId}
          onChange={(e) => update({ areaId: e.target.value })}
          className="rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs"
          aria-label="Filter by area"
        >
          <option value="ALL">All areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
