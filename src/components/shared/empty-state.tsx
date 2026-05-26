import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  /** Optional CTA (button, link). Rendered below the description. */
  action?: React.ReactNode
  /** Render inside a bordered card. Default `false` for inline use. */
  bordered?: boolean
  className?: string
}

/**
 * Calm empty state — used everywhere a list, surface, or section has no
 * content yet. Encourages, never punishes.
 *
 * Visual: small amber-tinted icon tile, display-font title, muted body,
 * optional CTA. Centered, generous vertical padding.
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
        bordered && "rounded-2xl border border-dashed border-border bg-card/40",
        className,
      )}
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber/10 text-amber">
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
