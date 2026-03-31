import { LegalDocument, legalMetadata } from "@/components/marketing/legal-document"
import { SITE_LEGAL_NAME } from "@/lib/legal"
import Link from "next/link"

export const metadata = legalMetadata(
  "Refund Policy",
  `Refund and cancellation terms for ${SITE_LEGAL_NAME} Pro subscriptions.`
)

export default function RefundPage() {
  return (
    <LegalDocument title="Refund Policy">
      <p>
        This Refund Policy describes how refunds and cancellations work for paid plans offered by{" "}
        {SITE_LEGAL_NAME}. It works together with our <Link href="/terms">Terms of Service</Link> and
        the terms presented by our payment processor at checkout (currently Lemon Squeezy, or as
        shown on your receipt).
      </p>

      <h2>1. Money-back guarantee (Pro subscriptions)</h2>
      <p>
        If you purchase a {SITE_LEGAL_NAME} Pro subscription, you may request a full refund within{" "}
        <strong>thirty (30) calendar days</strong> of the initial charge for that subscription period,
        for any reason. After that window, fees are generally non-refundable except where required
        by law or as stated below.
      </p>
      <p>
        This guarantee applies to the <strong>initial payment</strong> for a new Pro subscription
        (or the first charge after an upgrade from Free to Pro). Renewal charges are covered in
        Section 3.
      </p>

      <h2>2. How to request a refund</h2>
      <p>
        Email us at the address shown at the bottom of this page with the subject line
        &ldquo;Refund request,&rdquo; and include the email address on your account and, if
        available, your order or receipt ID from the payment provider. We may also direct you to the
        payment provider&rsquo;s customer portal to complete the refund when that is the fastest
        path.
      </p>
      <p>
        Approved refunds are typically processed within <strong>5–10 business days</strong>; timing
        for funds to appear on your statement depends on your bank or card issuer.
      </p>

      <h2>3. Renewals and cancellation</h2>
      <p>
        Subscriptions renew automatically until cancelled. To avoid being charged for the next
        period, cancel before the renewal date using the billing or subscription management options
        we provide (e.g., in Settings / billing) or through your payment provider&rsquo;s portal, as
        applicable.
      </p>
      <p>
        <strong>Renewal charges</strong> are generally non-refundable once the renewal period has
        started, except where required by law. If you believe a renewal was charged in error or
        without valid authorization, contact us promptly—we will work with you and the payment
        provider to investigate.
      </p>

      <h2>4. Chargebacks</h2>
      <p>
        If you initiate a chargeback, we may suspend your account pending resolution. We encourage
        you to contact us first so we can resolve billing issues without dispute fees.
      </p>

      <h2>5. Free tier</h2>
      <p>
        No fees apply to the free tier; this policy does not create payment obligations for free
        accounts.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update this Refund Policy from time to time. The &ldquo;Last updated&rdquo; date at
        the top reflects the current version. Material changes will be communicated as described in
        our Terms of Service.
      </p>
    </LegalDocument>
  )
}
