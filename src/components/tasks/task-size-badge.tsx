import type { ActionType } from "@prisma/client"
import { TASK_SIZE_LABEL } from "@/lib/tasks/task-display"
import { cn } from "@/lib/utils"

export function TaskSizeBadge({
  type,
  className,
}: {
  type: ActionType
  className?: string
}) {
  const label = TASK_SIZE_LABEL[type]
  if (!label) return null

  return (
    <span
      className={cn(
        "shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80",
        className,
      )}
    >
      {label}
    </span>
  )
}
