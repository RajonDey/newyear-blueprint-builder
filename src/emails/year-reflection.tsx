import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface YearReflectionEmailProps {
  userName?: string
  year: number
  appUrl: string
}

export function YearReflectionEmail({
  userName,
  year,
  appUrl,
}: YearReflectionEmailProps) {
  const wrappedUrl = `${appUrl}/wrapped`

  return (
    <EmailShell
      preview={`Before ${year} closes — pause and see what you actually lived.`}
      appUrl={appUrl}
      headline={`Your ${year} story`}
      userName={userName}
      reason={`You have an active ${year} plan — a once-a-year invitation to reflect.`}
      cta={{ label: "Open your Wrapped", href: wrappedUrl }}
    >
      <Text style={emailParagraph}>
        The year is winding down. Take ten quiet minutes to look back at your
        rhythm, wins, and lessons — then carry what matters into what comes next.
      </Text>
    </EmailShell>
  )
}
