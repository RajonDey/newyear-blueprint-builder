import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface QuarterlyReviewEmailProps {
  userName?: string
  quarter: string
  appUrl: string
}

export function QuarterlyReviewEmail({
  userName,
  quarter,
  appUrl,
}: QuarterlyReviewEmailProps) {
  const reviewUrl = `${appUrl}/rhythm/quarterly?tab=review`

  return (
    <EmailShell
      preview={`Time for your ${quarter} review — celebrate wins and adjust.`}
      appUrl={appUrl}
      headline={`${quarter} review`}
      userName={userName}
      reason="You're on Pro — this quarter's review is still open."
      cta={{ label: `Complete ${quarter} review`, href: reviewUrl }}
    >
      <Text style={emailParagraph}>
        Step back from the daily noise. Celebrate what moved, adjust what didn&apos;t,
        and stay aligned with your year.
      </Text>
    </EmailShell>
  )
}

/** @deprecated Use QuarterlyReviewEmail */
export const QuarterlyNudgeEmail = QuarterlyReviewEmail
