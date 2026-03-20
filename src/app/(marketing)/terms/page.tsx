import { LegalDocument, legalMetadata } from "@/components/marketing/legal-document"
import { SITE_LEGAL_NAME, getSiteDomain } from "@/lib/legal"
import Link from "next/link"

export const metadata = legalMetadata(
  "Terms of Service",
  `Terms of Service for ${SITE_LEGAL_NAME} — account rules, subscriptions, and acceptable use.`
)

export default function TermsPage() {
  const domain = getSiteDomain()

  return (
    <LegalDocument title="Terms of Service">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of{" "}
        {SITE_LEGAL_NAME}&rsquo;s websites, applications, and related services (collectively, the
        &ldquo;Service&rdquo;) operated by us at <strong>{domain}</strong>. By creating an account,
        clicking to accept, or using the Service, you agree to these Terms. If you do not agree, do
        not use the Service.
      </p>

      <h2>1. Eligibility and accounts</h2>
      <p>
        You must be at least the age of digital consent in your jurisdiction (typically 16 in the
        EEA/UK and 13 in the U.S., with higher ages in some regions) to use the Service. You are
        responsible for the accuracy of registration information and for maintaining the security of
        your credentials. Notify us promptly at the contact below if you suspect unauthorized use
        of your account.
      </p>

      <h2>2. The Service</h2>
      <p>
        {SITE_LEGAL_NAME} provides tools for annual planning, goal tracking, reflections, and related
        personal productivity features. We may update, modify, or discontinue features to improve
        the Service, comply with law, or address security. We do not guarantee uninterrupted or
        error-free operation.
      </p>

      <h2>3. Subscriptions, billing, and third-party checkout</h2>
      <p>
        Some features may be offered on a free tier and others on a paid &ldquo;Pro&rdquo; or
        similar subscription. Paid plans are processed by our payment partner (currently Lemon
        Squeezy or as disclosed at checkout). By purchasing, you agree to that provider&rsquo;s
        terms and to our{" "}
        <Link href="/refund">Refund Policy</Link>. Taxes may apply based on your location. Unless
        stated otherwise, subscriptions renew automatically until you cancel through the billing
        tools we provide or via the payment provider&rsquo;s customer portal, as applicable.
      </p>

      <h2>4. License to use the Service</h2>
      <p>
        Subject to these Terms, we grant you a personal, non-exclusive, non-transferable,
        revocable license to access and use the Service for your own non-commercial purposes,
        except where commercial use is expressly permitted in writing.
      </p>

      <h2>5. Your content</h2>
      <p>
        You may submit text, notes, goals, and similar materials (&ldquo;User Content&rdquo;) to the
        Service. You retain ownership of your User Content. You grant us a worldwide, non-exclusive
        license to host, store, process, display, and transmit User Content solely to operate,
        secure, improve, and provide the Service—including backups, redundancy, and support—consistent
        with our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p>
        You represent that you have the rights to your User Content and that it does not violate
        law or third-party rights. We may remove content or suspend access where we reasonably
        believe it violates these Terms or creates risk.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate applicable law or infringe others&rsquo; intellectual property or privacy.</li>
        <li>Attempt to probe, scan, or test the vulnerability of the Service without authorization.</li>
        <li>Interfere with or disrupt the Service, servers, or networks.</li>
        <li>Use the Service to distribute malware, spam, or deceptive content.</li>
        <li>Reverse engineer the Service except where such restriction is prohibited by law.</li>
        <li>Use automated means to access the Service in a way that imposes an unreasonable load.</li>
        <li>Resell, sublicense, or commercially exploit the Service without our written consent.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including software, design, branding, and documentation, is owned by us or our
        licensors and is protected by intellectual property laws. Except for the limited license
        above, no rights are granted. &ldquo;{SITE_LEGAL_NAME}&rdquo; and related marks are our
        trademarks; do not use them without permission.
      </p>

      <h2>8. Third-party services</h2>
      <p>
        The Service may integrate or link to third parties (e.g., authentication providers, email
        delivery, analytics, hosting). Your use of those services may be subject to their terms. We
        are not responsible for third-party services we do not control.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo; TO THE MAXIMUM
        EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY,
        INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        {SITE_LEGAL_NAME} IS A PERSONAL PLANNING TOOL; IT IS NOT MEDICAL, LEGAL, FINANCIAL, OR
        THERAPEUTIC ADVICE.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES, OFFICERS, DIRECTORS,
        EMPLOYEES, AND SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
        CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER
        INTANGIBLE LOSSES, ARISING FROM YOUR USE OF THE SERVICE. OUR AGGREGATE LIABILITY FOR CLAIMS
        RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID US FOR THE
        SERVICE IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS (US$100), IF
        YOU HAVE NOT PAID US. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE CASES,
        OUR LIABILITY IS LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You will defend, indemnify, and hold us harmless from claims, damages, losses, and expenses
        (including reasonable attorneys&rsquo; fees) arising from your User Content, your use of the
        Service in violation of these Terms, or your violation of law or third-party rights.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate access if you
        materially breach these Terms, create risk or legal exposure, or if we discontinue the
        Service. Provisions that by their nature should survive (e.g., disclaimers, limitations,
        indemnity) will survive termination.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may modify these Terms by posting an updated version on the Service and updating the
        &ldquo;Last updated&rdquo; date. If changes are material, we will provide reasonable notice
        (for example, by email or in-product notice). Continued use after the effective date
        constitutes acceptance. If you disagree, stop using the Service.
      </p>

      <h2>14. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of the State of Delaware, USA, excluding conflict-of-law
        rules, unless mandatory consumer protection laws in your country of residence require
        otherwise. You agree that courts in Delaware have exclusive jurisdiction for disputes,
        subject to any right you may have to bring claims in your local courts under mandatory law.
      </p>

      <h2>15. Miscellaneous</h2>
      <p>
        These Terms constitute the entire agreement regarding the Service and supersede prior
        understandings. If a provision is unenforceable, the remainder remains in effect. Failure to
        enforce a provision is not a waiver. You may not assign these Terms without our consent; we
        may assign them in connection with a merger, acquisition, or sale of assets.
      </p>
    </LegalDocument>
  )
}
