import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface WeeklyReminderEmailProps {
  userName?: string
  appUrl: string
}

export function WeeklyReminderEmail({ userName, appUrl }: WeeklyReminderEmailProps) {
  const checkInUrl = `${appUrl}/rhythm/weekly?tab=review`

  return (
    <EmailShell
      preview="Your weekly review awaits — reflect on your progress."
      appUrl={appUrl}
      headline="Review your week"
      userName={userName}
      reason="You have an active year plan and haven't logged this week's review yet."
      cta={{ label: "Open weekly review", href: checkInUrl }}
    >
      <Text style={emailParagraph}>
        A few minutes to look back at your goals, mood, and progress helps the next
        week stay intentional — not reactive.
      </Text>
    </EmailShell>
  )
}
