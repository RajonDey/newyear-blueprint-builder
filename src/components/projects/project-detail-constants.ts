import { AlertTriangle, Check, Clock } from "lucide-react"

export const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started", icon: Clock, color: "text-muted-foreground" },
  { value: "IN_PROGRESS", label: "In Progress", icon: Clock, color: "text-blue-600 dark:text-blue-400" },
  { value: "ON_TRACK", label: "On Track", icon: Check, color: "text-green-600 dark:text-green-400" },
  { value: "AT_RISK", label: "At Risk", icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400" },
  { value: "COMPLETED", label: "Completed", icon: Check, color: "text-emerald-600 dark:text-emerald-400" },
] as const

export const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
}

export const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
}
