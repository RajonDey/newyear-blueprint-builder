import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface FinishOnboardingEmailProps {
  userName?: string
  appUrl: string
}

export function FinishOnboardingEmail({
  userName,
  appUrl,
}: FinishOnboardingEmailProps) {
  const onboardingUrl = `${appUrl}/onboarding`

  return (
    <EmailShell
      preview="Your year is waiting — about ninety seconds to begin."
      appUrl={appUrl}
      headline="Finish setting up your year"
      userName={userName}
      reason="You signed up for YearInReview but haven't started your yearly plan yet."
      cta={{ label: "Complete setup", href: onboardingUrl }}
      showPreferencesFooter={false}
    >
      <Text style={emailParagraph}>
        Pick a theme word, mark your wheel of life, and name one project with a daily
        system. It takes about ninety seconds — then your dashboard is ready.
      </Text>
    </EmailShell>
  )
}
