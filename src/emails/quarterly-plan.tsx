import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface QuarterlyPlanEmailProps {
  userName?: string
  quarter: string
  appUrl: string
}

export function QuarterlyPlanEmail({
  userName,
  quarter,
  appUrl,
}: QuarterlyPlanEmailProps) {
  const planUrl = `${appUrl}/rhythm/quarterly?tab=plan`

  return (
    <EmailShell
      preview={`Plan ${quarter} — set the quarter before it runs away.`}
      appUrl={appUrl}
      headline={`Plan ${quarter}`}
      userName={userName}
      reason="You're on Pro — this quarter's plan is still open."
      cta={{ label: `Plan ${quarter}`, href: planUrl }}
    >
      <Text style={emailParagraph}>
        Step back from the weekly noise. Decide what this quarter is for and which
        projects carry the year forward.
      </Text>
    </EmailShell>
  )
}
