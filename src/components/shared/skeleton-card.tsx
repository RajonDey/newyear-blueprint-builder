import { cn } from "@/lib/utils"

interface SkeletonCardProps {
  /** Number of placeholder lines to render under the title block. */
  lines?: number
  /** Show a small icon placeholder in the top-left. */
  withIcon?: boolean
  /** Optional fixed height override (e.g. `"h-64"`). */
  className?: string
}

/**
 * Calm loading placeholder shaped like a content card.
 *
 * Use anywhere a `<Card>` is loading. Keeps the same border + padding so the
 * layout doesn't shift when real content arrives.
 */
export function SkeletonCard({
  lines = 3,
  withIcon,
  className,
}: SkeletonCardProps) {
  return (
    <div
      aria-busy="true"
      aria-hidden
      className={cn(
        "rounded-2xl border border-border bg-card p-6 animate-pulse",
        className,
      )}
    >
      {withIcon && (
        <div className="mb-4 h-9 w-9 rounded-lg bg-muted" />
      )}
      <div className="mb-3 h-5 w-1/2 rounded bg-muted" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 rounded bg-muted/80",
              i === lines - 1 ? "w-2/3" : "w-full",
            )}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Inline shimmer line — for replacing a single text node while loading.
 */
export function SkeletonLine({
  className,
  width = "w-32",
}: {
  className?: string
  width?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-4 rounded bg-muted animate-pulse align-middle",
        width,
        className,
      )}
    />
  )
}
