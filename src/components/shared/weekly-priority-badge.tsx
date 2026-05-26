import { Target } from "lucide-react"
import { cn } from "@/lib/utils"

/** Subtle badge for projects prioritized in the current weekly plan. */
export function WeeklyPriorityBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber",
        className,
      )}
    >
      <Target className="h-2.5 w-2.5" aria-hidden />
      This week
    </span>
  )
}
