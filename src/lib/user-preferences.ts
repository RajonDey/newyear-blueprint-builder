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
  /** Internal send bookkeeping for rhythm crons (Phase 1 dedupe). */
  emailMeta?: {
    /** UTC calendar date YYYY-MM-DD of last rhythm email sent. */
    lastRhythmEmailDate?: string
    /** ISO timestamp — finish onboarding nudge (once). */
    finishOnboardingSentAt?: string
    /** ISO timestamp — welcome after first plan (once). */
    welcomeSentAt?: string
    /** Calendar year when new-year setup email was last sent. */
    newYearSetupYear?: number
    /** Calendar year when year-end reflection email was last sent. */
    yearReflectionYear?: number
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

function parseEmailMeta(
  raw: unknown,
): UserPreferences["emailMeta"] | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined
  const m = raw as Record<string, unknown>
  const meta: NonNullable<UserPreferences["emailMeta"]> = {}
  if (typeof m.lastRhythmEmailDate === "string") {
    meta.lastRhythmEmailDate = m.lastRhythmEmailDate
  }
  if (typeof m.finishOnboardingSentAt === "string") {
    meta.finishOnboardingSentAt = m.finishOnboardingSentAt
  }
  if (typeof m.welcomeSentAt === "string") {
    meta.welcomeSentAt = m.welcomeSentAt
  }
  if (typeof m.newYearSetupYear === "number") {
    meta.newYearSetupYear = m.newYearSetupYear
  }
  if (typeof m.yearReflectionYear === "number") {
    meta.yearReflectionYear = m.yearReflectionYear
  }
  return Object.keys(meta).length > 0 ? meta : undefined
}

export function parseUserPreferences(raw: unknown): UserPreferences {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const obj = raw as Record<string, unknown>

  const weekOneChecklist = parseWeekOneChecklist(obj.weekOneChecklist)
  const emailPreferences = parseEmailPreferences(obj.emailPreferences)
  const emailMeta = parseEmailMeta(obj.emailMeta)

  return {
    ...(weekOneChecklist ? { weekOneChecklist } : {}),
    ...(emailPreferences ? { emailPreferences } : {}),
    ...(emailMeta ? { emailMeta } : {}),
  }
}

export function mergeUserPreferences(
  current: UserPreferences,
  patch: UserPreferences,
): UserPreferences {
  const merged: UserPreferences = {}

  const weekOneChecklist = {
    ...current.weekOneChecklist,
    ...patch.weekOneChecklist,
  }
  if (Object.keys(weekOneChecklist).length > 0) {
    merged.weekOneChecklist = weekOneChecklist
  }

  const emailPreferences = {
    ...current.emailPreferences,
    ...patch.emailPreferences,
  }
  if (Object.keys(emailPreferences).length > 0) {
    merged.emailPreferences = emailPreferences
  }

  const emailMeta = {
    ...current.emailMeta,
    ...patch.emailMeta,
  }
  if (Object.keys(emailMeta).length > 0) {
    merged.emailMeta = emailMeta
  }

  return merged
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
