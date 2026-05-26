"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import type { VisionItemKind } from "@prisma/client"
import { apiFetch } from "@/lib/api-fetch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const KIND_LABEL: Record<VisionItemKind, string> = {
  STATEMENT: "Statement",
  VALUE: "Value",
  MILESTONE: "Milestone",
  IMAGE: "Image",
  QUOTE: "Quote",
}

export function ProjectVisionLink({
  projectId,
  currentVisionItem,
  visionItems,
}: {
  projectId: string
  currentVisionItem: { id: string; title: string; kind: VisionItemKind } | null
  visionItems: { id: string; title: string; kind: VisionItemKind }[]
}) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const value = currentVisionItem?.id ?? "none"

  async function updateVisionItem(next: string) {
    const visionItemId = next === "none" ? null : next
    if (visionItemId === (currentVisionItem?.id ?? null)) return

    setSaving(true)
    const result = await apiFetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visionItemId }),
      errorMessage: "Could not update vision link",
    })
    setSaving(false)

    if (!result.ok) return
    toast.success(
      visionItemId ? "Linked to your life vision" : "Vision link cleared",
    )
    router.refresh()
  }

  if (visionItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber" />
          Add cards on your{" "}
          <Link href="/vision" className="text-foreground hover:text-amber transition-colors">
            life vision
          </Link>{" "}
          board, then link this project to the milestone it serves.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground inline-flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber" />
        Serves vision
      </span>
      <Select value={value} onValueChange={(v) => void updateVisionItem(v)} disabled={saving}>
        <SelectTrigger className="w-[min(100%,320px)]">
          <SelectValue placeholder="Choose a vision card…" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not linked</SelectItem>
          {visionItems.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              <span className="truncate">
                {KIND_LABEL[item.kind]} · {item.title}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {saving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
      {currentVisionItem ? (
        <Link
          href="/vision"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View on vision board →
        </Link>
      ) : null}
    </div>
  )
}
