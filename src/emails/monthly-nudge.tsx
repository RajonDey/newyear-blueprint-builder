import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { EmailPreferencesFooter } from "@/emails/email-preferences-footer"

interface MonthlyNudgeEmailProps {
  userName?: string
  monthLabel: string
  appUrl: string
}

export function MonthlyNudgeEmail({
  userName,
  monthLabel,
  appUrl,
}: MonthlyNudgeEmailProps) {
  const reviewUrl = `${appUrl}/rhythm/monthly?tab=review`

  return (
    <Html>
      <Head />
      <Preview>Your {monthLabel} review is waiting — reflect and adjust.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{monthLabel} review</Heading>
          <Text style={paragraph}>
            {userName ? `Hi ${userName},` : "Hi,"}
          </Text>
          <Text style={paragraph}>
            A new month has begun. Take a few minutes to look back at your wins,
            name what was hard, and set your focus for what&apos;s ahead.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={reviewUrl}>
              Complete {monthLabel} review
            </Button>
          </Section>
          <Text style={footer}>
            You&apos;re receiving this as a Pro subscriber with an active year plan.
          </Text>
          <EmailPreferencesFooter appUrl={appUrl} />
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#faf8f5",
  fontFamily: "Georgia, serif",
}

const container = {
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
}

const heading = {
  color: "#5c4d3c",
  fontSize: "24px",
  fontWeight: "600",
  marginBottom: "24px",
}

const paragraph = {
  color: "#5c4d3c",
  fontSize: "16px",
  lineHeight: "24px",
  marginBottom: "16px",
}

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
}

const button = {
  backgroundColor: "#8b7355",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "6px",
  fontSize: "16px",
  textDecoration: "none",
}

const footer = {
  color: "#8b7355",
  fontSize: "12px",
  marginTop: "32px",
}
