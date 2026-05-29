import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface MonthlyPlanEmailProps {
  userName?: string
  monthLabel: string
  appUrl: string
}

export function MonthlyPlanEmail({
  userName,
  monthLabel,
  appUrl,
}: MonthlyPlanEmailProps) {
  const planUrl = `${appUrl}/rhythm/monthly?tab=plan`

  return (
    <EmailShell
      preview={`Plan ${monthLabel} — set intentions before the month fills up.`}
      appUrl={appUrl}
      headline={`Plan ${monthLabel}`}
      userName={userName}
      reason="You're on Pro — this month's plan is still open."
      cta={{ label: `Plan ${monthLabel}`, href: planUrl }}
    >
      <Text style={emailParagraph}>
        Name a focus for the month and the projects that deserve your attention
        before the week-by-week rhythm takes over.
      </Text>
    </EmailShell>
  )
}
