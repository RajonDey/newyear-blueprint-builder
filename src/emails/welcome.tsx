import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface WelcomeEmailProps {
  userName?: string
  appUrl: string
}

export function WelcomeEmail({ userName, appUrl }: WelcomeEmailProps) {
  const dashboardUrl = `${appUrl}/dashboard`

  return (
    <EmailShell
      preview="Your year has a home — here's how the rhythm works."
      appUrl={appUrl}
      headline="You're in"
      userName={userName}
      reason="You just created your first yearly plan — a one-time welcome from us."
      cta={{ label: "Open your dashboard", href: dashboardUrl }}
      showPreferencesFooter={false}
    >
      <Text style={emailParagraph}>
        Plan your week on Sunday, review on Friday, and keep one small daily system
        moving. You can tune email reminders anytime in Settings.
      </Text>
    </EmailShell>
  )
}
