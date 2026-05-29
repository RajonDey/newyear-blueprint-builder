import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface WeeklyPlanEmailProps {
  userName?: string
  appUrl: string
  weekNumber: number
}

export function WeeklyPlanEmail({
  userName,
  appUrl,
  weekNumber,
}: WeeklyPlanEmailProps) {
  const planUrl = `${appUrl}/rhythm/weekly?tab=plan`

  return (
    <EmailShell
      preview={`Plan week ${weekNumber} — pick priorities before the week begins.`}
      appUrl={appUrl}
      headline={`Plan week ${weekNumber}`}
      userName={userName}
      reason="You have an active year plan and haven't set this week's priorities yet."
      cta={{ label: "Plan your week", href: planUrl }}
    >
      <Text style={emailParagraph}>
        A short plan on Sunday evening sets the tone: which projects matter, what to
        protect, and how the week should feel before Monday arrives.
      </Text>
    </EmailShell>
  )
}
