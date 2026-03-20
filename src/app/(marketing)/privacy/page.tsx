import { LegalDocument, legalMetadata } from "@/components/marketing/legal-document"
import { SITE_LEGAL_NAME, getSiteDomain } from "@/lib/legal"
import Link from "next/link"

export const metadata = legalMetadata(
  "Privacy Policy",
  `How ${SITE_LEGAL_NAME} collects, uses, and protects your personal information.`
)

export default function PrivacyPage() {
  const domain = getSiteDomain()

  return (
    <LegalDocument title="Privacy Policy">
      <p>
        This Privacy Policy explains how {SITE_LEGAL_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) collects, uses, discloses, and protects information when you use our
        websites and applications at <strong>{domain}</strong> (the &ldquo;Service&rdquo;). By using
        the Service, you agree to this policy. If you do not agree, please do not use the Service.
      </p>

      <h2>1. Information we collect</h2>
      <h3>1.1 You provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, profile image (if you sign in with a
          provider that supplies it), and authentication identifiers.
        </li>
        <li>
          <strong>Plan and billing:</strong> subscription status and transaction references processed
          by our payment provider; we do not store full payment card numbers on our servers.
        </li>
        <li>
          <strong>User content:</strong> goals, reflections, check-ins, notes, wheel-of-life
          ratings, and similar content you enter into the Service.
        </li>
        <li>
          <strong>Support:</strong> information you send when you contact us.
        </li>
      </ul>

      <h3>1.2 Collected automatically</h3>
      <ul>
        <li>
          <strong>Device and log data:</strong> IP address, browser type, general location derived
          from IP, timestamps, and diagnostic logs to secure and operate the Service.
        </li>
        <li>
          <strong>Cookies and similar technologies:</strong> as described in our{" "}
          <Link href="/cookies">Cookie Policy</Link>.
        </li>
      </ul>

      <h2>2. How we use information</h2>
      <p>We use information to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service and your account.</li>
        <li>Process subscriptions and communicate about billing, security, and policy changes.</li>
        <li>Send transactional and product emails (e.g., magic links, reminders if enabled).</li>
        <li>Detect, prevent, and address fraud, abuse, and technical issues.</li>
        <li>Comply with legal obligations and enforce our terms.</li>
        <li>
          Analyze usage in aggregate or de-identified form where we use analytics tools (see
          Cookies)—only as configured and permitted by law.
        </li>
      </ul>

      <h2>3. Legal bases (EEA, UK, and similar)</h2>
      <p>Where GDPR or similar law applies, we rely on:</p>
      <ul>
        <li>
          <strong>Contract:</strong> providing the Service you requested.
        </li>
        <li>
          <strong>Legitimate interests:</strong> security, product improvement, and internal
          analytics, balanced against your rights.
        </li>
        <li>
          <strong>Consent:</strong> where required (e.g., non-essential cookies or marketing)—you may
          withdraw consent at any time.
        </li>
        <li>
          <strong>Legal obligation:</strong> where we must retain or disclose data by law.
        </li>
      </ul>

      <h2>4. How we share information</h2>
      <p>
        We do not sell your personal information as that term is defined under the CCPA/CPRA. We
        share data with:
      </p>
      <ul>
        <li>
          <strong>Service providers</strong> who process data on our instructions (e.g., hosting—such
          as Vercel, database—such as Neon, email—such as Resend, payments—such as Lemon Squeezy,
          authentication—such as Google for OAuth). Their use is governed by contracts and their
          privacy policies.
        </li>
        <li>
          <strong>Analytics providers</strong> if you enable or we configure optional analytics
          (e.g., PostHog)—as described in our Cookie Policy.
        </li>
        <li>
          <strong>Legal and safety:</strong> when required by law, legal process, or to protect
          rights, safety, and security.
        </li>
        <li>
          <strong>Business transfers:</strong> in a merger, acquisition, or asset sale, with notice
          where required.
        </li>
      </ul>

      <h2>5. International transfers</h2>
      <p>
        We may process data in the United States and other countries where we or our providers
        operate. Where required, we use appropriate safeguards (such as Standard Contractual
        Clauses) for transfers from the EEA, UK, or Switzerland.
      </p>

      <h2>6. Retention</h2>
      <p>
        We retain information for as long as your account is active and as needed to provide the
        Service, comply with law, resolve disputes, and enforce agreements. You may delete certain
        content in-product; account deletion may be available through settings or by contacting us.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard technical and organizational measures to protect data. No method of
        transmission or storage is 100% secure; we cannot guarantee absolute security.
      </p>

      <h2>8. Your rights and choices</h2>
      <p>
        Depending on where you live, you may have rights to access, correct, delete, port, or
        restrict processing of your personal data, and to object to certain processing. You may
        withdraw consent where processing is consent-based.
      </p>
      <p>
        <strong>California residents:</strong> see our{" "}
        <Link href="/privacy/california">California Privacy Notice</Link> for CPRA-specific
        disclosures and how to exercise rights.
      </p>
      <p>
        To exercise rights, contact us using the email at the bottom of this page. We may verify
        your request as permitted by law. You may lodge a complaint with your local supervisory
        authority.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 13 (or the minimum age in your jurisdiction).
        We do not knowingly collect personal information from children. If you believe we have,
        contact us and we will take appropriate steps to delete it.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised policy and
        update the &ldquo;Last updated&rdquo; date. For material changes, we will provide
        additional notice where appropriate.
      </p>
    </LegalDocument>
  )
}
