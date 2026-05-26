import { AlertTriangle, Check, Clock } from "lucide-react"

/* Hallmark · design-system: design.md · designed-as-app */

export const STATUS_OPTIONS = [
  {
    value: "NOT_STARTED",
    label: "Not Started",
    icon: Clock,
    color: "text-muted-foreground",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    icon: Clock,
    color: "text-foreground",
  },
  {
    value: "ON_TRACK",
    label: "On Track",
    icon: Check,
    color: "text-status-positive",
  },
  {
    value: "AT_RISK",
    label: "At Risk",
    icon: AlertTriangle,
    color: "text-status-attention",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    icon: Check,
    color: "text-status-positive",
  },
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
