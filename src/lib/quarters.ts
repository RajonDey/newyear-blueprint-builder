import type { Quarter } from "@prisma/client"

export const QUARTER_OPTIONS = [
  { value: "Q1" as const, label: "Q1", months: "Jan – Mar" },
  { value: "Q2" as const, label: "Q2", months: "Apr – Jun" },
  { value: "Q3" as const, label: "Q3", months: "Jul – Sep" },
  { value: "Q4" as const, label: "Q4", months: "Oct – Dec" },
] as const

export type QuarterValue = (typeof QUARTER_OPTIONS)[number]["value"]

const QUARTER_ORDER: QuarterValue[] = ["Q1", "Q2", "Q3", "Q4"]

export function parseQuarterParam(
  value: string | string[] | null | undefined,
): QuarterValue | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === "Q1" || raw === "Q2" || raw === "Q3" || raw === "Q4") return raw
  return undefined
}

export function quarterLabel(quarter: Quarter | string): string {
  return QUARTER_OPTIONS.find((q) => q.value === quarter)?.label ?? quarter
}

export function quarterMonthsLabel(quarter: Quarter | string): string {
  return QUARTER_OPTIONS.find((q) => q.value === quarter)?.months ?? ""
}

export function quarterIndex(quarter: Quarter | string): number {
  return QUARTER_ORDER.indexOf(quarter as QuarterValue)
}

export function isPastQuarter(
  quarter: Quarter | string,
  year: number,
  now = new Date(),
): boolean {
  const currentYear = now.getFullYear()
  const currentQ = QUARTER_ORDER[Math.floor(now.getMonth() / 3)]!
  if (year < currentYear) return true
  if (year > currentYear) return false
  return quarterIndex(quarter) < quarterIndex(currentQ)
}

export function isFutureQuarter(
  quarter: Quarter | string,
  year: number,
  now = new Date(),
): boolean {
  const currentYear = now.getFullYear()
  const currentQ = QUARTER_ORDER[Math.floor(now.getMonth() / 3)]!
  if (year > currentYear) return true
  if (year < currentYear) return false
  return quarterIndex(quarter) > quarterIndex(currentQ)
}
