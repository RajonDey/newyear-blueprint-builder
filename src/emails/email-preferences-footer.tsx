import { Link, Text } from "@react-email/components"
import { emailColors } from "@/emails/email-styles"

const footerStyle = {
  color: emailColors.sand,
  fontSize: "12px",
  lineHeight: "18px",
  marginTop: "8px",
} as const

const linkStyle = {
  color: emailColors.sand,
  textDecoration: "underline",
} as const

export function EmailPreferencesFooter({ appUrl }: { appUrl: string }) {
  const settingsUrl = `${appUrl}/settings#notifications`

  return (
    <Text style={footerStyle}>
      <Link href={settingsUrl} style={linkStyle}>
        Manage email preferences
      </Link>
      {" · "}
      Turn off reminders anytime in Settings.
    </Text>
  )
}
