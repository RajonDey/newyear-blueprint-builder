import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface MonthlyReviewEmailProps {
  userName?: string
  monthLabel: string
  appUrl: string
}

export function MonthlyReviewEmail({
  userName,
  monthLabel,
  appUrl,
}: MonthlyReviewEmailProps) {
  const reviewUrl = `${appUrl}/rhythm/monthly?tab=review`

  return (
    <EmailShell
      preview={`Your ${monthLabel} review is waiting — reflect and adjust.`}
      appUrl={appUrl}
      headline={`${monthLabel} review`}
      userName={userName}
      reason="You're on Pro — this month's review is still open."
      cta={{ label: `Complete ${monthLabel} review`, href: reviewUrl }}
    >
      <Text style={emailParagraph}>
        Look back at what worked, name what was hard, and set a clear focus for what
        comes next.
      </Text>
    </EmailShell>
  )
}

/** @deprecated Use MonthlyReviewEmail */
export const MonthlyNudgeEmail = MonthlyReviewEmail
