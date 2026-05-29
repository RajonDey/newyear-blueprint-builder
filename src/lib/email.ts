import { Resend } from "resend"
import { WeeklyPlanEmail } from "@/emails/weekly-plan"
import { WeeklyReminderEmail } from "@/emails/weekly-reminder"
import { MonthlyPlanEmail } from "@/emails/monthly-plan"
import { MonthlyReviewEmail } from "@/emails/monthly-review"
import { QuarterlyPlanEmail } from "@/emails/quarterly-plan"
import { QuarterlyReviewEmail } from "@/emails/quarterly-review"
import { DailyNudgeEmail } from "@/emails/daily-nudge"
import { FinishOnboardingEmail } from "@/emails/finish-onboarding"
import { WelcomeEmail } from "@/emails/welcome"
import { NewYearSetupEmail } from "@/emails/new-year-setup"
import { YearReflectionEmail } from "@/emails/year-reflection"
import { getBaseUrl } from "./utils"

let resendSingleton: Resend | null = null

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured")
  }
  if (!resendSingleton) {
    resendSingleton = new Resend(key)
  }
  return resendSingleton
}

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  process.env.RESEND_FROM_EMAIL ||
  "YearInReview <onboarding@resend.dev>"

export async function sendWeeklyPlan(
  to: string,
  weekNumber: number,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Plan your week · Week ${weekNumber}`,
    react: WeeklyPlanEmail({ userName: name, appUrl, weekNumber }),
  })
  if (error) throw error
  return data
}

export async function sendWeeklyReview(to: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Review your week",
    react: WeeklyReminderEmail({ userName: name, appUrl }),
  })
  if (error) throw error
  return data
}

/** @deprecated Use sendWeeklyReview */
export async function sendWeeklyReminder(to: string, name?: string) {
  return sendWeeklyReview(to, name)
}

export async function sendMonthlyPlan(
  to: string,
  monthLabel: string,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Plan ${monthLabel}`,
    react: MonthlyPlanEmail({ userName: name, monthLabel, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendMonthlyReview(
  to: string,
  monthLabel: string,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Review ${monthLabel}`,
    react: MonthlyReviewEmail({ userName: name, monthLabel, appUrl }),
  })
  if (error) throw error
  return data
}

/** @deprecated Use sendMonthlyReview */
export async function sendMonthlyNudge(to: string, monthLabel: string, name?: string) {
  return sendMonthlyReview(to, monthLabel, name)
}

export async function sendQuarterlyPlan(
  to: string,
  quarter: string,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Plan ${quarter}`,
    react: QuarterlyPlanEmail({ userName: name, quarter, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendQuarterlyReview(
  to: string,
  quarter: string,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Review ${quarter}`,
    react: QuarterlyReviewEmail({ userName: name, quarter, appUrl }),
  })
  if (error) throw error
  return data
}

/** @deprecated Use sendQuarterlyReview */
export async function sendQuarterlyNudge(to: string, quarter: string, name?: string) {
  return sendQuarterlyReview(to, quarter, name)
}

export async function sendDailyNudge(to: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Just one tiny habit today...",
    react: DailyNudgeEmail({ userName: name, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendFinishOnboardingEmail(to: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Finish setting up your year",
    react: FinishOnboardingEmail({ userName: name, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "You're in — welcome to YearInReview",
    react: WelcomeEmail({ userName: name, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendNewYearSetupEmail(
  to: string,
  year: number,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Begin ${year} in YearInReview`,
    react: NewYearSetupEmail({ userName: name, year, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendYearReflectionEmail(
  to: string,
  year: number,
  name?: string,
) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Look back at ${year}`,
    react: YearReflectionEmail({ userName: name, year, appUrl }),
  })
  if (error) throw error
  return data
}
