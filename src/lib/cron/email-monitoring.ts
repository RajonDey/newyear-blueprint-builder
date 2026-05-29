import { db } from "@/lib/db"

export const RESEND_FREE_DAILY_CAP = 100
export const RESEND_PRO_MONTHLY_CAP = 50_000

export function emailDailyWarnThreshold(): number {
  const raw = process.env.EMAIL_DAILY_WARN_THRESHOLD
  if (!raw) return 80
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : 80
}

/** Logs a warning when a single cron run approaches the Resend free daily cap. */
export function warnIfHighEmailVolume(jobName: string, sentCount: number): void {
  const threshold = emailDailyWarnThreshold()
  if (sentCount >= threshold) {
    console.warn(
      `[email] ${jobName} sent ${sentCount} messages in one run — ` +
        `approaching Resend free tier daily cap (${RESEND_FREE_DAILY_CAP}). ` +
        `Consider upgrading to Pro ($20/mo) or check EMAIL_DAILY_WARN_THRESHOLD.`,
    )
  }
}

export type EmailHealthMetrics = {
  activePlanUsers: number
  proUsers: number
  estimatedWorstCaseDailyRhythmSends: number
  resendFreeDailyCap: number
  resendProMonthlyCap: number
  warnThreshold: number
  recommendation: string
}

export async function getEmailHealthMetrics(): Promise<EmailHealthMetrics> {
  const [activePlanUsers, proUsers] = await Promise.all([
    db.user.count({
      where: {
        disabledAt: null,
        yearlyPlans: { some: { status: "ACTIVE" } },
      },
    }),
    db.user.count({
      where: {
        disabledAt: null,
        planTier: "PRO",
        yearlyPlans: { some: { status: "ACTIVE" } },
      },
    }),
  ])

  const recommendation =
    activePlanUsers >= 100
      ? "Upgrade to Resend Pro ($20/mo) — you are at or above ~100 active users."
      : activePlanUsers >= 80
        ? "Monitor Resend dashboard daily; upgrade to Pro before hitting 100 active users."
        : "Free tier is fine at current scale; rhythm sends are conditional and timezone-spread."

  return {
    activePlanUsers,
    proUsers,
    estimatedWorstCaseDailyRhythmSends: activePlanUsers,
    resendFreeDailyCap: RESEND_FREE_DAILY_CAP,
    resendProMonthlyCap: RESEND_PRO_MONTHLY_CAP,
    warnThreshold: emailDailyWarnThreshold(),
    recommendation,
  }
}
