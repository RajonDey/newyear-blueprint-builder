/** One-line monthly intention for a project. */
export type MonthlyProjectIntention = {
  projectId: string
  text: string
}

export function parseProjectIntentions(raw: unknown): MonthlyProjectIntention[] {
  if (!Array.isArray(raw)) return []
  return (raw as unknown[]).flatMap((row) => {
    if (
      row &&
      typeof row === "object" &&
      "projectId" in row &&
      "text" in row &&
      typeof (row as { projectId: unknown }).projectId === "string" &&
      typeof (row as { text: unknown }).text === "string"
    ) {
      return [
        {
          projectId: (row as { projectId: string }).projectId,
          text: (row as { text: string }).text,
        },
      ]
    }
    return []
  })
}

export function parseTopIntentions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return (raw as unknown[])
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
}

export function projectIntentionsToRecord(
  rows: MonthlyProjectIntention[],
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const row of rows) {
    if (row.text.trim()) out[row.projectId] = row.text.trim()
  }
  return out
}

export function recordToProjectIntentions(
  record: Record<string, string>,
): MonthlyProjectIntention[] {
  return Object.entries(record).map(([projectId, text]) => ({
    projectId,
    text,
  }))
}
