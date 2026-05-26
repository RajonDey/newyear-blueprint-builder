import { parseProjectIntentions, parseTopIntentions } from "@/types/monthly"

export function cadencePlanHasContent(row: {
  monthFocus?: string | null
  quarterFocus?: string | null
  projectIntentions: unknown
  topIntentions: unknown
}): boolean {
  if (row.monthFocus?.trim() || row.quarterFocus?.trim()) return true
  if (parseTopIntentions(row.topIntentions).length > 0) return true
  return parseProjectIntentions(row.projectIntentions).some((p) => p.text.trim())
}
