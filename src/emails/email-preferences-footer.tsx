import { Link, Text } from "@react-email/components"

const footerStyle = {
  color: "#8b7355",
  fontSize: "12px",
  marginTop: "32px",
  lineHeight: "18px",
} as const

const linkStyle = {
  color: "#8b7355",
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
