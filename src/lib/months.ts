export const MONTH_OPTIONS = [
  { value: 1, label: "Jan", full: "January" },
  { value: 2, label: "Feb", full: "February" },
  { value: 3, label: "Mar", full: "March" },
  { value: 4, label: "Apr", full: "April" },
  { value: 5, label: "May", full: "May" },
  { value: 6, label: "Jun", full: "June" },
  { value: 7, label: "Jul", full: "July" },
  { value: 8, label: "Aug", full: "August" },
  { value: 9, label: "Sep", full: "September" },
  { value: 10, label: "Oct", full: "October" },
  { value: 11, label: "Nov", full: "November" },
  { value: 12, label: "Dec", full: "December" },
] as const

export function parseMonthParam(
  value: string | string[] | null | undefined,
): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return undefined
  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 1 || n > 12) return undefined
  return n
}

export function monthLabel(month: number): string {
  return MONTH_OPTIONS.find((m) => m.value === month)?.full ?? `Month ${month}`
}

export function monthShortLabel(month: number): string {
  return MONTH_OPTIONS.find((m) => m.value === month)?.label ?? `M${month}`
}
