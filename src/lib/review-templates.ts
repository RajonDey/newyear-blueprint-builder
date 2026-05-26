import type { ReviewCadence } from "@prisma/client"
import { sanitizeRichTextHtml } from "@/lib/sanitize"
import { db } from "@/lib/db"

/** One prompt on the Monthly / Quarterly review form — answers keyed by `key`. */
export type ReviewTemplateField = {
  key: string
  label: string
  placeholder?: string
}

const KEY_REGEX = /^[a-z][a-z0-9_]{0,47}$/

export const DEFAULT_MONTHLY_REVIEW_FIELDS: ReviewTemplateField[] = [
  {
    key: "summary",
    label: "Monthly Summary",
    placeholder: "What was the dominant theme of this month?",
  },
  {
    key: "winsText",
    label: "Wins",
    placeholder: "Celebrate the best executions of the last four weeks…",
  },
  {
    key: "challengesText",
    label: "Challenges",
    placeholder: "What friction consistently showed up?",
  },
  {
    key: "adjustments",
    label: "Adjustments",
    placeholder: "How will you adjust heading into the next month?",
  },
]

export const DEFAULT_QUARTERLY_REVIEW_FIELDS: ReviewTemplateField[] = [
  {
    key: "summary",
    label: "Summary",
    placeholder: "What happened this quarter? The big picture…",
  },
  {
    key: "winsText",
    label: "Wins",
    placeholder: "Celebrate your victories — big and small…",
  },
  {
    key: "challengesText",
    label: "Challenges",
    placeholder: "What was difficult? What got in the way?",
  },
  {
    key: "adjustments",
    label: "Adjustments",
    placeholder: "What will you do differently next quarter?",
  },
]

export function defaultFieldsForCadence(
  cadence: ReviewCadence,
): ReviewTemplateField[] {
  return cadence === "MONTHLY"
    ? DEFAULT_MONTHLY_REVIEW_FIELDS
    : DEFAULT_QUARTERLY_REVIEW_FIELDS
}

/** Validates shape + uniqueness; throws nothing — returns normalized array or null. */
export function normalizeReviewTemplateFields(
  raw: unknown,
): ReviewTemplateField[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 12) return null
  const keys = new Set<string>()
  const out: ReviewTemplateField[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") return null
    const key = String((row as { key?: unknown }).key ?? "").trim()
    const label = String((row as { label?: unknown }).label ?? "").trim()
    const placeholderRaw = (row as { placeholder?: unknown }).placeholder
    const placeholder =
      placeholderRaw === undefined || placeholderRaw === null
        ? undefined
        : String(placeholderRaw).trim().slice(0, 300)
    if (!KEY_REGEX.test(key)) return null
    if (!label || label.length > 120) return null
    if (keys.has(key)) return null
    keys.add(key)
    out.push({ key, label, placeholder: placeholder || undefined })
  }
  return out
}

export async function getReviewTemplateFields(
  userId: string,
  cadence: ReviewCadence,
): Promise<ReviewTemplateField[]> {
  const row = await db.reviewTemplate.findUnique({
    where: { userId_cadence: { userId, cadence } },
    select: { fields: true },
  })
  if (!row?.fields) return defaultFieldsForCadence(cadence)
  const parsed = normalizeReviewTemplateFields(row.fields)
  return parsed ?? defaultFieldsForCadence(cadence)
}

/** Merge legacy columns with JSON `responses` (responses win on key overlap). */
export function mergeMonthlyResponses(row: {
  responses: unknown
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
}): Record<string, string> {
  const legacy: Record<string, string> = {
    summary: row.summary ?? "",
    winsText: row.winsText ?? "",
    challengesText: row.challengesText ?? "",
    adjustments: row.adjustments ?? "",
  }
  if (
    row.responses &&
    typeof row.responses === "object" &&
    !Array.isArray(row.responses)
  ) {
    for (const [k, v] of Object.entries(row.responses as Record<string, unknown>)) {
      if (typeof v === "string") legacy[k] = v
    }
  }
  return legacy
}

export function mergeQuarterlyResponses(row: {
  responses: unknown
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
}): Record<string, string> {
  return mergeMonthlyResponses(row)
}

/** Build UI state object with empty strings for every template field key. */
export function blankResponsesForTemplate(
  fields: ReviewTemplateField[],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const f of fields) out[f.key] = ""
  return out
}

/** Hydrate saved answers into template-shaped map (drops keys not in template). */
export function pickResponsesForTemplate(
  fields: ReviewTemplateField[],
  mergedRow: Record<string, string>,
): Record<string, string> {
  const out = blankResponsesForTemplate(fields)
  for (const f of fields) {
    const v = mergedRow[f.key]
    if (typeof v === "string") out[f.key] = v
  }
  return out
}

export function sanitizeResponsesRecord(
  raw: Record<string, string>,
): Record<string, string | null> {
  const out: Record<string, string | null> = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!KEY_REGEX.test(k)) continue
    const safe = sanitizeRichTextHtml(v)
    out[k] = safe || null
  }
  return out
}

/** Legacy columns stay in sync when these keys exist after sanitization. */
export function legacyFromResponses(safe: Record<string, string | null>): {
  summary: string | null
  winsText: string | null
  challengesText: string | null
  adjustments: string | null
} {
  return {
    summary: safe.summary ?? null,
    winsText: safe.winsText ?? null,
    challengesText: safe.challengesText ?? null,
    adjustments: safe.adjustments ?? null,
  }
}

/** Merge legacy flat keys + arbitrary `responses`, prune to template keys, sanitize. */
export function mergeIncomingReviewResponses(
  fields: ReviewTemplateField[],
  incoming: {
    responses?: Record<string, string>
    summary?: string
    winsText?: string
    challengesText?: string
    adjustments?: string
  },
): Record<string, string | null> {
  const merged: Record<string, string> = {}
  if (incoming.summary !== undefined) merged.summary = incoming.summary
  if (incoming.winsText !== undefined) merged.winsText = incoming.winsText
  if (incoming.challengesText !== undefined)
    merged.challengesText = incoming.challengesText
  if (incoming.adjustments !== undefined) merged.adjustments = incoming.adjustments
  if (incoming.responses) {
    for (const [k, v] of Object.entries(incoming.responses)) {
      merged[k] = v
    }
  }
  const allowed = new Set(fields.map((f) => f.key))
  const pruned: Record<string, string> = {}
  for (const key of allowed) {
    pruned[key] = merged[key] ?? ""
  }
  return sanitizeResponsesRecord(pruned)
}
