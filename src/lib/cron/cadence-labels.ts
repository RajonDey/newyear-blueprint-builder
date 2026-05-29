export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

export function monthLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? `Month ${month}`
}

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const

export type QuarterLabel = (typeof QUARTERS)[number]

export function getCurrentQuarter(date: Date = new Date()): QuarterLabel {
  const month = date.getMonth()
  if (month < 3) return "Q1"
  if (month < 6) return "Q2"
  if (month < 9) return "Q3"
  return "Q4"
}
