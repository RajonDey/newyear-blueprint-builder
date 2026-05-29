import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface DailyNudgeEmailProps {
  userName?: string
  appUrl: string
}

export function DailyNudgeEmail({ userName, appUrl }: DailyNudgeEmailProps) {
  const systemsUrl = `${appUrl}/systems`

  return (
    <EmailShell
      preview="One small habit today keeps the momentum alive."
      appUrl={appUrl}
      headline="Keep the chain going"
      userName={userName}
      reason="Your daily systems streak slipped a couple of days ago — we send this once to help you restart."
      cta={{ label: "Tick off a habit", href: systemsUrl }}
    >
      <Text style={emailParagraph}>
        Perfection isn&apos;t the goal. One tiny daily move today is enough to pick the
        thread back up.
      </Text>
    </EmailShell>
  )
}
