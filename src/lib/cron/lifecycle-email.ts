import {
  sendFinishOnboardingEmail,
  sendNewYearSetupEmail,
  sendWelcomeEmail,
  sendYearReflectionEmail,
} from "@/lib/email"
import { db } from "@/lib/db"
import {
  mergeUserPreferences,
  parseUserPreferences,
  type UserPreferences,
} from "@/lib/user-preferences"
import { cronSendDelayMs, sleep } from "@/lib/cron/send-rhythm-email"
import {
  getLocalYear,
  isNewYearSetupWindowForUser,
  isYearReflectionWindowForUser,
  normalizeTimeZone,
} from "@/lib/cron/timezone-window"

export type LifecycleEmailKind =
  | "finishOnboarding"
  | "welcome"
  | "newYearSetup"

export type LifecycleEmailResult =
  | { status: "sent" }
  | { status: "skipped" }
  | { status: "error"; message: string }

type SendLifecycleInput = {
  userId: string
  email: string
  preferences: unknown
  metaPatch: UserPreferences["emailMeta"]
  send: () => Promise<unknown>
}

const ONBOARDING_GRACE_MS = 24 * 60 * 60 * 1000

/** @deprecated Use isNewYearSetupWindowForUser with user timezone. */
export function isNewYearSetupWindow(date: Date = new Date()): boolean {
  return isNewYearSetupWindowForUser(date, "UTC")
}

/** @deprecated Use isYearReflectionWindowForUser with user timezone. */
export function isYearReflectionWindow(date: Date = new Date()): boolean {
  return isYearReflectionWindowForUser(date, "UTC")
}

async function sendLifecycleEmailOnce({
  userId,
  email,
  preferences,
  metaPatch,
  send,
}: SendLifecycleInput): Promise<LifecycleEmailResult> {
  try {
    await send()
    const current = parseUserPreferences(preferences)
    await db.user.update({
      where: { id: userId },
      data: {
        preferences: mergeUserPreferences(current, { emailMeta: metaPatch }),
      },
    })
    return { status: "sent" }
  } catch (e) {
    return {
      status: "error",
      message: e instanceof Error ? e.message : "Unknown error",
    }
  }
}

export async function sendWelcomeEmailOnce(
  userId: string,
  email: string,
  name?: string,
  preferences?: unknown,
): Promise<LifecycleEmailResult> {
  const prefs = parseUserPreferences(preferences)
  if (prefs.emailMeta?.welcomeSentAt) {
    return { status: "skipped" }
  }

  return sendLifecycleEmailOnce({
    userId,
    email,
    preferences: prefs,
    metaPatch: { welcomeSentAt: new Date().toISOString() },
    send: () => sendWelcomeEmail(email, name),
  })
}

export type LifecycleCronSummary = {
  finishOnboarding: { sent: number; skipped: number; errors: string[] }
  welcomeFallback: { sent: number; skipped: number; errors: string[] }
  newYearSetup: { sent: number; skipped: number; errors: string[] }
  yearReflection: { sent: number; skipped: number; errors: string[] }
}

export async function runLifecycleCron(
  now: Date = new Date(),
): Promise<LifecycleCronSummary> {
  const summary: LifecycleCronSummary = {
    finishOnboarding: { sent: 0, skipped: 0, errors: [] },
    welcomeFallback: { sent: 0, skipped: 0, errors: [] },
    newYearSetup: { sent: 0, skipped: 0, errors: [] },
    yearReflection: { sent: 0, skipped: 0, errors: [] },
  }
  const delayMs = cronSendDelayMs()
  const cutoff = new Date(now.getTime() - ONBOARDING_GRACE_MS)

  const ghostUsers = await db.user.findMany({
    where: {
      disabledAt: null,
      createdAt: { lte: cutoff },
      yearlyPlans: { none: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
    },
  })

  for (const user of ghostUsers) {
    const prefs = parseUserPreferences(user.preferences)
    if (prefs.emailMeta?.finishOnboardingSentAt) {
      summary.finishOnboarding.skipped++
      continue
    }

    const result = await sendLifecycleEmailOnce({
      userId: user.id,
      email: user.email,
      preferences: prefs,
      metaPatch: { finishOnboardingSentAt: now.toISOString() },
      send: () =>
        sendFinishOnboardingEmail(user.email, user.name ?? undefined),
    })

    if (result.status === "sent") {
      summary.finishOnboarding.sent++
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped") {
      summary.finishOnboarding.skipped++
    } else {
      summary.finishOnboarding.errors.push(`${user.email}: ${result.message}`)
    }
  }

  const welcomeCandidates = await db.user.findMany({
    where: {
      disabledAt: null,
      yearlyPlans: { some: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
    },
  })

  for (const user of welcomeCandidates) {
    const prefs = parseUserPreferences(user.preferences)
    if (prefs.emailMeta?.welcomeSentAt) {
      summary.welcomeFallback.skipped++
      continue
    }

    const result = await sendLifecycleEmailOnce({
      userId: user.id,
      email: user.email,
      preferences: prefs,
      metaPatch: { welcomeSentAt: now.toISOString() },
      send: () => sendWelcomeEmail(user.email, user.name ?? undefined),
    })

    if (result.status === "sent") {
      summary.welcomeFallback.sent++
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped") {
      summary.welcomeFallback.skipped++
    } else {
      summary.welcomeFallback.errors.push(`${user.email}: ${result.message}`)
    }
  }

  const returningCandidates = await db.user.findMany({
    where: {
      disabledAt: null,
      yearlyPlans: { some: {} },
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
      timezone: true,
      yearlyPlans: { select: { year: true, status: true } },
    },
  })

  for (const user of returningCandidates) {
    const timeZone = normalizeTimeZone(user.timezone)
    if (!isNewYearSetupWindowForUser(now, timeZone)) continue

    const localYear = getLocalYear(now, timeZone)
    const hasActiveLocalYear = user.yearlyPlans.some(
      (plan) => plan.status === "ACTIVE" && plan.year === localYear,
    )
    if (hasActiveLocalYear) {
      summary.newYearSetup.skipped++
      continue
    }

    const prefs = parseUserPreferences(user.preferences)
    if (prefs.emailMeta?.newYearSetupYear === localYear) {
      summary.newYearSetup.skipped++
      continue
    }

    const result = await sendLifecycleEmailOnce({
      userId: user.id,
      email: user.email,
      preferences: prefs,
      metaPatch: { newYearSetupYear: localYear },
      send: () =>
        sendNewYearSetupEmail(user.email, localYear, user.name ?? undefined),
    })

    if (result.status === "sent") {
      summary.newYearSetup.sent++
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped") {
      summary.newYearSetup.skipped++
    } else {
      summary.newYearSetup.errors.push(`${user.email}: ${result.message}`)
    }
  }

  const reflectionCandidates = await db.user.findMany({
    where: {
      disabledAt: null,
      yearlyPlans: { some: { status: "ACTIVE" } },
    },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
      timezone: true,
      yearlyPlans: {
        where: { status: "ACTIVE" },
        select: { year: true },
      },
    },
  })

  for (const user of reflectionCandidates) {
    const timeZone = normalizeTimeZone(user.timezone)
    if (!isYearReflectionWindowForUser(now, timeZone)) continue

    const localYear = getLocalYear(now, timeZone)
    const hasActiveLocalYear = user.yearlyPlans.some(
      (plan) => plan.year === localYear,
    )
    if (!hasActiveLocalYear) {
      summary.yearReflection.skipped++
      continue
    }

    const prefs = parseUserPreferences(user.preferences)
    if (prefs.emailMeta?.yearReflectionYear === localYear) {
      summary.yearReflection.skipped++
      continue
    }

    const result = await sendLifecycleEmailOnce({
      userId: user.id,
      email: user.email,
      preferences: prefs,
      metaPatch: { yearReflectionYear: localYear },
      send: () =>
        sendYearReflectionEmail(
          user.email,
          localYear,
          user.name ?? undefined,
        ),
    })

    if (result.status === "sent") {
      summary.yearReflection.sent++
      if (delayMs > 0) await sleep(delayMs)
    } else if (result.status === "skipped") {
      summary.yearReflection.skipped++
    } else {
      summary.yearReflection.errors.push(`${user.email}: ${result.message}`)
    }
  }

  return summary
}
