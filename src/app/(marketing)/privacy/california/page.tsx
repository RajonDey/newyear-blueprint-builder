import { LegalDocument, legalMetadata } from "@/components/marketing/legal-document"
import { SITE_LEGAL_NAME } from "@/lib/legal"
import Link from "next/link"

export const metadata = legalMetadata(
  "California Privacy Notice",
  `CPRA disclosures and privacy rights for California residents using ${SITE_LEGAL_NAME}.`
)

export default function CaliforniaPrivacyPage() {
  return (
    <LegalDocument title="California Privacy Notice">
      <p>
        This California Privacy Notice supplements our <Link href="/privacy">Privacy Policy</Link>{" "}
        and applies to California residents under the California Consumer Privacy Act (CCPA), as
        amended by the California Privacy Rights Act (CPRA). Terms like &ldquo;personal
        information,&rdquo; &ldquo;sell,&rdquo; and &ldquo;share&rdquo; have the meanings given in
        the CCPA/CPRA.
      </p>

      <h2>1. We do not sell personal information</h2>
      <p>
        {SITE_LEGAL_NAME} does <strong>not</strong> sell your personal information for money. We do
        not share personal information for cross-context behavioral advertising in a manner that
        constitutes &ldquo;sharing&rdquo; under the CPRA, except where we might use optional
        analytics in the future—in that case we will disclose the practice and, where required,
        provide a &ldquo;Do not sell or share my personal information&rdquo; link and honor
        opt-out signals such as the Global Privacy Control where applicable.
      </p>

      <h2>2. Categories of personal information collected</h2>
      <p>
        In the preceding twelve months, we may have collected the following categories (depending on
        how you use the Service):
      </p>
      <ul>
        <li>
          <strong>Identifiers:</strong> name, email, account ID, IP address.
        </li>
        <li>
          <strong>Customer records (Cal. Civ. Code § 1798.80(e)):</strong> payment-related
          identifiers as processed by our payment provider (not full card numbers stored by us).
        </li>
        <li>
          <strong>Commercial information:</strong> subscription tier, purchase history references.
        </li>
        <li>
          <strong>Internet or network activity:</strong> interactions with the Service, logs,
          device/browser data.
        </li>
        <li>
          <strong>Geolocation data:</strong> general location from IP.
        </li>
        <li>
          <strong>Inferences:</strong> derived from usage (e.g., feature usage patterns in aggregate
          or to personalize the product).
        </li>
        <li>
          <strong>Sensitive personal information:</strong> we do not intentionally collect sensitive
          categories under CPRA (e.g., precise geolocation, health, biometrics) as part of the
          Service; do not submit such information unless a feature explicitly requires it and
          describes how it is used.
        </li>
      </ul>

      <h2>3. Purposes for collection and use</h2>
      <p>We use categories above for the business purposes described in our Privacy Policy, including:</p>
      <ul>
        <li>Operating, securing, and improving the Service.</li>
        <li>Processing subscriptions and support requests.</li>
        <li>Complying with law and enforcing terms.</li>
        <li>Analytics in accordance with our Cookie Policy.</li>
      </ul>

      <h2>4. Retention</h2>
      <p>
        We retain each category only as long as reasonably necessary for the purposes described,
        unless a longer period is required by law.
      </p>

      <h2>5. Your California rights</h2>
      <p>Subject to exceptions, California residents may have the right to:</p>
      <ul>
        <li>
          <strong>Know and access</strong> personal information we hold about you.
        </li>
        <li>
          <strong>Delete</strong> personal information, subject to legal exceptions.
        </li>
        <li>
          <strong>Correct</strong> inaccurate personal information.
        </li>
        <li>
          <strong>Opt out</strong> of the sale or sharing of personal information (we do not sell;
          see Section 1 for sharing/analytics).
        </li>
        <li>
          <strong>Limit use</strong> of sensitive personal information (we limit collection as
          described above).
        </li>
        <li>
          <strong>Non-discrimination</strong> for exercising these rights.
        </li>
      </ul>

      <h2>6. How to submit a request</h2>
      <p>
        Email us at the address at the bottom of this page with &ldquo;California privacy
        request&rdquo; in the subject line. We will verify your request in line with CCPA
        regulations. You may designate an authorized agent; we may require proof of agency.
      </p>

      <h2>7. Shine the Light</h2>
      <p>
        California residents may request information about disclosure of personal information to
        third parties for their direct marketing purposes under California Civil Code § 1798.83. We
        do not disclose personal information to third parties for their direct marketing purposes as
        described in that law.
      </p>

      <p className="text-sm text-muted-foreground not-prose mt-8">
        This notice is for informational purposes and does not constitute legal advice. Have counsel
        review for your entity and data practices.
      </p>
    </LegalDocument>
  )
}
