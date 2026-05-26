import { cn } from "@/lib/utils"
import type { AreaHealth, AreaHealthTone } from "@/lib/queries/area-health"

const TONE_STYLES: Record<
  AreaHealthTone,
  { dot: string; text: string; ring: string }
> = {
  quiet: {
    dot: "bg-muted-foreground/30",
    text: "text-muted-foreground",
    ring: "ring-muted-foreground/20",
  },
  green: {
    dot: "bg-emerald-500/80",
    text: "text-emerald-700 dark:text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  amber: {
    dot: "bg-amber/80",
    text: "text-amber",
    ring: "ring-amber/25",
  },
}

export function AreaHealthIndicator({
  health,
  showLabel = true,
  size = "sm",
}: {
  health: AreaHealth
  showLabel?: boolean
  size?: "sm" | "md"
}) {
  const styles = TONE_STYLES[health.tone]
  const dotSize = size === "md" ? "h-2.5 w-2.5" : "h-2 w-2"

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", styles.text)}
      title={health.label}
    >
      <span
        className={cn(
          "rounded-full shrink-0 ring-1 ring-inset",
          dotSize,
          styles.dot,
          styles.ring,
        )}
        aria-hidden
      />
      {showLabel ? (
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {health.tone === "quiet"
            ? "Quiet"
            : health.tone === "green"
              ? "Steady"
              : "Check in"}
        </span>
      ) : null}
    </span>
  )
}
