import { Resend } from "resend"
import { WeeklyReminderEmail } from "@/emails/weekly-reminder"
import { MonthlyNudgeEmail } from "@/emails/monthly-nudge"
import { QuarterlyNudgeEmail } from "@/emails/quarterly-nudge"
import { DailyNudgeEmail } from "@/emails/daily-nudge"
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

export async function sendWeeklyReminder(to: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your weekly review awaits",
    react: WeeklyReminderEmail({ userName: name, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendMonthlyNudge(to: string, monthLabel: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Time for your ${monthLabel} review`,
    react: MonthlyNudgeEmail({ userName: name, monthLabel, appUrl }),
  })
  if (error) throw error
  return data
}

export async function sendQuarterlyNudge(to: string, quarter: string, name?: string) {
  const resend = getResend()
  const appUrl = getBaseUrl()
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Time for your ${quarter} review`,
    react: QuarterlyNudgeEmail({ userName: name, quarter, appUrl }),
  })
  if (error) throw error
  return data
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
