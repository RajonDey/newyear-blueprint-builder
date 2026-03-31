export const GOAL_STATUS = {
  NOT_STARTED: { label: "Not Started", bg: "bg-muted", text: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", bg: "bg-primary/10", text: "text-primary dark:text-primary" },
  ON_TRACK: { label: "On Track", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
  AT_RISK: { label: "At Risk", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400" },
  COMPLETED: { label: "Completed", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400" },
  ABANDONED: { label: "Abandoned", bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
} as const

export function getStatusStyle(status: string) {
  const s = GOAL_STATUS[status as keyof typeof GOAL_STATUS] ?? GOAL_STATUS.NOT_STARTED
  return { label: s.label, className: `${s.bg} ${s.text}` }
}
