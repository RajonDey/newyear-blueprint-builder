/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { Sparkles } from "lucide-react"

export function VisionProjectsStrip({
  linkedMilestoneCount,
}: {
  linkedMilestoneCount: number
}) {
  if (linkedMilestoneCount <= 0) return null

  const label =
    linkedMilestoneCount === 1
      ? "1 vision milestone has active projects"
      : `${linkedMilestoneCount} vision milestones have active projects`

  return (
    <Link
      href="/vision"
      className="flex items-center gap-3 border-y border-border py-3 text-sm transition-colors hover:bg-muted/30"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-tint text-amber">
        <Sparkles className="h-4 w-4" />
      </span>
      <span>
        <span className="font-medium text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground mt-0.5">
          Foundation · Life vision connected to this year&apos;s work
        </span>
      </span>
      <span className="ml-auto text-xs text-muted-foreground">View vision →</span>
    </Link>
  )
}
