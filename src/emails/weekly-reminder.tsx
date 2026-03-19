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

interface WeeklyReminderEmailProps {
  userName?: string
  appUrl: string
}

export function WeeklyReminderEmail({ userName, appUrl }: WeeklyReminderEmailProps) {
  const checkInUrl = `${appUrl}/check-in/weekly`

  return (
    <Html>
      <Head />
      <Preview>Your weekly check-in awaits — reflect on your progress.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Weekly Check-in Reminder</Heading>
          <Text style={paragraph}>
            {userName ? `Hi ${userName},` : "Hi,"}
          </Text>
          <Text style={paragraph}>
            It&apos;s time for your weekly reflection. A few minutes to review your goals,
            mood, and progress can make a real difference in staying on track.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={checkInUrl}>
              Do Your Check-in
            </Button>
          </Section>
          <Text style={footer}>
            You&apos;re receiving this because you have an active yearly plan.
          </Text>
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
