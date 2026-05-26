import { format } from "date-fns"
import type { ActionType } from "@prisma/client"

export const TASK_SIZE_LABEL: Record<ActionType, string | null> = {
  SMALL: null,
  MEDIUM: "Med",
  BIG: "Big",
}

export function taskDateToInputValue(date: Date | string | null | undefined): string {
  if (!date) return ""
  return format(new Date(date), "yyyy-MM-dd")
}
