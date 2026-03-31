import type { Metadata } from "next"
import Link from "next/link"
import {
  LEGAL_LAST_UPDATED,
  SITE_LEGAL_NAME,
  getSiteDomain,
  getSiteOriginForLegal,
  getSupportEmail,
} from "@/lib/legal"

export function legalMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title: `${title} | ${SITE_LEGAL_NAME}`, description },
  }
}

export function LegalDocument({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const email = getSupportEmail()
  const domain = getSiteDomain()
  const officialSite = getSiteOriginForLegal()

  return (
    <div className="container max-w-3xl py-16 md:py-24">
      <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
        <p className="text-sm text-muted-foreground not-prose mb-2">
          Last updated: {LEGAL_LAST_UPDATED}
        </p>
        <h1 className="not-prose font-display text-3xl font-semibold tracking-tight text-foreground mb-8">
          {title}
        </h1>

        <aside className="not-prose rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground mb-10">
          These policies are provided for transparency and operational clarity.{" "}
          <strong className="text-foreground">They are not a substitute for legal advice.</strong>{" "}
          Have qualified counsel review them before you rely on them for compliance, fundraising, or
          disputes—especially if you operate under a formal entity name or outside the United States.
        </aside>

        {children}

        <section className="not-prose mt-14 pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">{SITE_LEGAL_NAME}</span> — official site:{" "}
            <a href={officialSite} className="text-primary hover:underline font-medium">
              {officialSite.replace(/^https:\/\//, "")}
            </a>
            . Questions about these policies:{" "}
            <a className="text-primary hover:underline" href={`mailto:${email}`}>
              {email}
            </a>
            . Related:{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms
            </Link>
            {" · "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy
            </Link>
            {" · "}
            <Link href="/refund" className="text-primary hover:underline">
              Refunds
            </Link>
            {" · "}
            <Link href="/cookies" className="text-primary hover:underline">
              Cookies
            </Link>
            {" · "}
            <Link href="/privacy/california" className="text-primary hover:underline">
              California privacy
            </Link>
            .
          </p>
        </section>
      </article>
    </div>
  )
}
