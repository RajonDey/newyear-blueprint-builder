import { addDays, endOfDay, endOfWeek, format, startOfDay } from "date-fns"

export type TaskBucketKey = "today" | "week" | "backlog"

/** Default due date so a new task lands in the bucket being viewed. */
export function defaultTargetDateForBucket(
  bucket: TaskBucketKey,
  now = new Date(),
): string | null {
  if (bucket === "backlog") return null

  if (bucket === "today") {
    return endOfDay(now).toISOString()
  }

  const todayEnd = endOfDay(now)
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const tomorrow = endOfDay(addDays(startOfDay(now), 1))

  if (tomorrow <= weekEnd && tomorrow > todayEnd) {
    return tomorrow.toISOString()
  }

  return endOfDay(weekEnd).toISOString()
}

/** `<input type="date">` value for a bucket default (local calendar day). */
export function defaultDateInputForBucket(
  bucket: TaskBucketKey,
  now = new Date(),
): string {
  const iso = defaultTargetDateForBucket(bucket, now)
  if (!iso) return ""
  return format(new Date(iso), "yyyy-MM-dd")
}

export function dateInputToIsoEndOfDay(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return endOfDay(new Date(y, m - 1, d)).toISOString()
}
