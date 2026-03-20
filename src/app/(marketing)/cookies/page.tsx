import { LegalDocument, legalMetadata } from "@/components/marketing/legal-document"
import { SITE_LEGAL_NAME, getSiteDomain } from "@/lib/legal"
import Link from "next/link"

export const metadata = legalMetadata(
  "Cookie Policy",
  `How ${SITE_LEGAL_NAME} uses cookies and similar technologies.`
)

export default function CookiesPage() {
  const domain = getSiteDomain()

  return (
    <LegalDocument title="Cookie Policy">
      <p>
        This Cookie Policy explains how {SITE_LEGAL_NAME} (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) uses cookies and similar technologies when you visit{" "}
        <strong>{domain}</strong> and use our Service. It should be read with our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device. We also use similar technologies such
        as local storage (e.g., for in-app preferences or saving wizard progress in your browser)
        and pixels or SDKs from analytics providers when enabled.
      </p>

      <h2>2. How we use cookies</h2>
      <h3>2.1 Strictly necessary</h3>
      <p>
        These are required for the Service to function—for example, session and security cookies
        that keep you logged in, protect against abuse, and route traffic. You cannot opt out of
        these without losing core functionality.
      </p>

      <h3>2.2 Functional</h3>
      <p>
        These remember choices you make (such as theme/light or dark mode) or store client-side data
        you expect to persist on your device (for example, multi-step plan drafts stored locally in
        your browser). They do not track you across unrelated sites.
      </p>

      <h3>2.3 Analytics (optional)</h3>
      <p>
        If we enable product analytics (for example, PostHog or similar), those tools may set cookies
        or use local storage to distinguish sessions and measure usage in aggregate. We configure
        such tools to minimize personal data where possible. Where required by law, we will request
        consent before using non-essential analytics cookies.
      </p>

      <h2>3. Third-party cookies</h2>
      <p>
        When you sign in with Google or complete checkout with our payment provider, those services
        may set their own cookies subject to their policies. Embedded content (if any) may also set
        cookies. We do not control third-party cookies.
      </p>

      <h2>4. Managing preferences</h2>
      <p>
        Most browsers let you block or delete cookies. You can also use private browsing modes.
        Blocking all cookies may prevent sign-in or break features. For analytics, if we offer an
        in-product consent banner or settings toggle, use that to align with your preference.
      </p>

      <h2>5. Do Not Track</h2>
      <p>
        There is no consistent industry standard for &ldquo;Do Not Track&rdquo; signals. We treat
        privacy choices through applicable consent mechanisms and browser controls as described
        above.
      </p>

      <h2>6. Updates</h2>
      <p>
        We may update this Cookie Policy when our practices change. Check the &ldquo;Last
        updated&rdquo; date and review our <Link href="/privacy">Privacy Policy</Link> for broader
        data practices.
      </p>
    </LegalDocument>
  )
}
