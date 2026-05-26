/* Hallmark · design-system: design.md · designed-as-app */

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** Optional CTA (button, link). Rendered below the description. */
  action?: React.ReactNode
  /** Render with a hairline border. Default `false` for inline use. */
  bordered?: boolean
  className?: string
}

/**
 * Calm empty state — used everywhere a list, surface, or section has no
 * content yet. Encourages, never punishes.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  bordered,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        bordered && "border-y border-border py-14",
        className,
      )}
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-tint text-amber">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl md:text-2xl tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
