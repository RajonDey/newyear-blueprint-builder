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

interface DailyNudgeEmailProps {
  userName?: string
  appUrl: string
}

export function DailyNudgeEmail({ userName, appUrl }: DailyNudgeEmailProps) {
  const dashboardUrl = `${appUrl}/systems`

  return (
    <Html>
      <Head />
      <Preview>One small habit today keeps the momentum alive.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Keep the chain going</Heading>
          <Text style={paragraph}>
            {userName ? `Hi ${userName},` : "Hi,"}
          </Text>
          <Text style={paragraph}>
            It&apos;s been a couple of days since your last check-in. Don&apos;t worry — perfection is the enemy of progress. All it takes is ticking off a single, tiny daily habit today to get your momentum back!
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={dashboardUrl}>
              Tick Off a Habit
            </Button>
          </Section>
          <Text style={footer}>
            You&apos;re receiving this because you have an active yearly plan. We only send this reminder once when you slip up to help you stay accountable.
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
