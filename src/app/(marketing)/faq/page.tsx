import type { Metadata } from "next"
import Link from "next/link"
import { CtaBand } from "@/components/marketing/sections/cta-band"
import { FaqAccordion } from "@/components/marketing/faq-accordion"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { MARKETING_FAQS } from "@/lib/marketing/faq-content"
import { buildFaqPageJsonLd } from "@/lib/seo/json-ld"

/* Hallmark · design-system: design.md · designed-as-app
 * FAQ — Letter lede + conversational Q&A (Wave E).
 */

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about pricing, privacy, exports, and how YearInReview fits into your year.",
}

export default function FaqPage() {
  return (
    <>
      <JsonLdScript data={buildFaqPageJsonLd(MARKETING_FAQS)} />
      <section className="container pt-14 md:pt-20 pb-10 md:pb-14">
        <div className="max-w-xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            Questions we hear often,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            The honest answers.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            Still stuck?{" "}
            <Link
              href="/pricing"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              See pricing
            </Link>{" "}
            or read the{" "}
            <Link
              href="/refund"
              className="text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
            >
              refund policy
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="container pb-14 md:pb-20">
        <FaqAccordion items={MARKETING_FAQS} />
      </section>

      <CtaBand />
    </>
  )
}
