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

interface QuarterlyNudgeEmailProps {
  userName?: string
  quarter: string
  appUrl: string
}

export function QuarterlyNudgeEmail({
  userName,
  quarter,
  appUrl,
}: QuarterlyNudgeEmailProps) {
  const reviewUrl = `${appUrl}/rhythm/quarterly?tab=review`

  return (
    <Html>
      <Head />
      <Preview>Time for your {quarter} review — celebrate wins and adjust.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>{quarter} Review</Heading>
          <Text style={paragraph}>
            {userName ? `Hi ${userName},` : "Hi,"}
          </Text>
          <Text style={paragraph}>
            A new quarter has begun. This is the perfect moment to reflect on your
            progress, celebrate your wins, and make any adjustments to stay aligned
            with your vision.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={reviewUrl}>
              Complete {quarter} Review
            </Button>
          </Section>
          <Text style={footer}>
            You&apos;re receiving this as a Pro subscriber.
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
