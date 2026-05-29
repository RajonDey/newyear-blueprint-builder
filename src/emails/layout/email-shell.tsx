import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { EmailPreferencesFooter } from "@/emails/email-preferences-footer"
import { emailColors, emailFonts, emailLayout } from "@/emails/email-styles"

export type EmailShellProps = {
  preview: string
  appUrl: string
  headline: string
  /** One line explaining why the user received this email. */
  reason: string
  userName?: string
  cta: { label: string; href: string }
  children: React.ReactNode
  /** Lifecycle / transactional emails hide rhythm opt-out footer. */
  showPreferencesFooter?: boolean
}

export function EmailShell({
  preview,
  appUrl,
  headline,
  reason,
  userName,
  cta,
  children,
  showPreferencesFooter = true,
}: EmailShellProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "YearInReview"

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Text style={styles.wordmark}>
            <Link href={appUrl} style={styles.wordmarkLink}>
              {appName}
            </Link>
          </Text>
          <Hr style={styles.rule} />
          <Heading style={styles.headline}>{headline}</Heading>
          <Text style={styles.greeting}>{userName ? `Hi ${userName},` : "Hi,"}</Text>
          {children}
          <Section style={styles.ctaWrap}>
            <Button style={styles.cta} href={cta.href}>
              {cta.label}
            </Button>
          </Section>
          <Text style={styles.reason}>{reason}</Text>
          {showPreferencesFooter ? (
            <EmailPreferencesFooter appUrl={appUrl} />
          ) : null}
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: emailColors.paper,
    fontFamily: emailFonts.body,
    margin: 0,
    padding: "24px 12px",
  },
  container: {
    backgroundColor: "#ffffff",
    border: `1px solid ${emailColors.border}`,
    borderRadius: emailLayout.radius,
    margin: "0 auto",
    maxWidth: emailLayout.maxWidth,
    padding: "32px 28px",
  },
  wordmark: {
    fontFamily: emailFonts.display,
    fontSize: "18px",
    fontStyle: "italic" as const,
    margin: "0 0 16px",
    textAlign: "left" as const,
  },
  wordmarkLink: {
    color: emailColors.ink,
    textDecoration: "none",
  },
  rule: {
    borderColor: emailColors.border,
    margin: "0 0 28px",
  },
  headline: {
    color: emailColors.ink,
    fontFamily: emailFonts.display,
    fontSize: "26px",
    fontWeight: 600,
    lineHeight: "1.2",
    margin: "0 0 20px",
  },
  greeting: {
    color: emailColors.ink,
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 12px",
  },
  ctaWrap: {
    margin: "28px 0 24px",
    textAlign: "center" as const,
  },
  cta: {
    backgroundColor: emailColors.amber,
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: 600,
    padding: "12px 28px",
    textDecoration: "none",
  },
  reason: {
    color: emailColors.sand,
    fontSize: "12px",
    lineHeight: "18px",
    margin: "0 0 8px",
  },
} as const

export const emailParagraph = {
  color: emailColors.muted,
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
} as const
