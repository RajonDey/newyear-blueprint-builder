/** Shape stored on `User.preferences` — extend as new prefs are added. */
export type UserPreferences = {
  weekOneChecklist?: {
    dismissedAt?: string
    visitedVisionAt?: string
  }
  emailPreferences?: {
    weeklyReviewReminder?: boolean
    monthlyNudge?: boolean
    quarterlyNudge?: boolean
    dailyNudge?: boolean
  }
}

export type EmailPreferenceKey =
  | "weeklyReviewReminder"
  | "monthlyNudge"
  | "quarterlyNudge"
  | "dailyNudge"

export type ResolvedEmailPreferences = Record<EmailPreferenceKey, boolean>

function parseWeekOneChecklist(
  raw: unknown,
): UserPreferences["weekOneChecklist"] | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const w = raw as Record<string, unknown>
  return {
    dismissedAt:
      typeof w.dismissedAt === "string" ? w.dismissedAt : undefined,
    visitedVisionAt:
      typeof w.visitedVisionAt === "string" ? w.visitedVisionAt : undefined,
  }
}

function parseEmailPreferences(
  raw: unknown,
): UserPreferences["emailPreferences"] | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const e = raw as Record<string, unknown>
  const prefs: NonNullable<UserPreferences["emailPreferences"]> = {}
  if (typeof e.weeklyReviewReminder === "boolean") {
    prefs.weeklyReviewReminder = e.weeklyReviewReminder
  }
  if (typeof e.monthlyNudge === "boolean") {
    prefs.monthlyNudge = e.monthlyNudge
  }
  if (typeof e.quarterlyNudge === "boolean") {
    prefs.quarterlyNudge = e.quarterlyNudge
  }
  if (typeof e.dailyNudge === "boolean") {
    prefs.dailyNudge = e.dailyNudge
  }
  return Object.keys(prefs).length > 0 ? prefs : undefined
}

export function parseUserPreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const obj = raw as Record<string, unknown>

  const weekOneChecklist = parseWeekOneChecklist(obj.weekOneChecklist)
  const emailPreferences = parseEmailPreferences(obj.emailPreferences)

  return {
    ...(weekOneChecklist ? { weekOneChecklist } : {}),
    ...(emailPreferences ? { emailPreferences } : {}),
  }
}

export function mergeUserPreferences(
  current: UserPreferences,
  patch: UserPreferences,
): UserPreferences {
  return {
    weekOneChecklist: {
      ...current.weekOneChecklist,
      ...patch.weekOneChecklist,
    },
    emailPreferences: {
      ...current.emailPreferences,
      ...patch.emailPreferences,
    },
  }
}

export function getEmailPreferences(
  prefs: UserPreferences,
): ResolvedEmailPreferences {
  return {
    weeklyReviewReminder:
      prefs.emailPreferences?.weeklyReviewReminder ?? true,
    monthlyNudge: prefs.emailPreferences?.monthlyNudge ?? true,
    quarterlyNudge: prefs.emailPreferences?.quarterlyNudge ?? true,
    dailyNudge: prefs.emailPreferences?.dailyNudge ?? true,
  }
}

export function isEmailPreferenceEnabled(
  prefs: UserPreferences,
  key: EmailPreferenceKey,
): boolean {
  return getEmailPreferences(prefs)[key]
}

export function isWeekOneChecklistDismissed(prefs: UserPreferences): boolean {
  return Boolean(prefs.weekOneChecklist?.dismissedAt)
}

export function hasVisitedVision(prefs: UserPreferences): boolean {
  return Boolean(prefs.weekOneChecklist?.visitedVisionAt)
}
