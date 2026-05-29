import { Text } from "@react-email/components"
import { EmailShell, emailParagraph } from "@/emails/layout/email-shell"

interface NewYearSetupEmailProps {
  userName?: string
  year: number
  appUrl: string
}

export function NewYearSetupEmail({
  userName,
  year,
  appUrl,
}: NewYearSetupEmailProps) {
  const settingsUrl = `${appUrl}/settings#your-year`

  return (
    <EmailShell
      preview={`Start your ${year} plan — light setup, no full re-onboarding.`}
      appUrl={appUrl}
      headline={`Begin ${year}`}
      userName={userName}
      reason={`You have a YearInReview account but no active plan for ${year} yet.`}
      cta={{ label: `Set up ${year}`, href: settingsUrl }}
      showPreferencesFooter={true}
    >
      <Text style={emailParagraph}>
        Archive a finished year or start the new one with a theme word — a light setup,
        not the full onboarding wizard. Your history stays intact.
      </Text>
    </EmailShell>
  )
}
