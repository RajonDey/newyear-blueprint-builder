import type { Metadata } from "next"
import { JsonLdScript } from "@/components/seo/json-ld-script"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { buildSoftwareApplicationJsonLd } from "@/lib/seo/json-ld"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo/site"
import { Hero } from "@/components/marketing/sections/hero"
import { Problem } from "@/components/marketing/sections/problem"
import { Guide } from "@/components/marketing/sections/guide"
import { Plan } from "@/components/marketing/sections/plan"
import { FeaturesTeaser } from "@/components/marketing/sections/features-teaser"
import { Contrast } from "@/components/marketing/sections/contrast"
import { EchoBlock } from "@/components/marketing/sections/echo-block"
import { PricingTeaser } from "@/components/marketing/sections/pricing-teaser"
import { CtaBand } from "@/components/marketing/sections/cta-band"

/* Hallmark · design-system: design.md · designed-as-app
 * Marketing homepage — editorial Letter voice with split layouts + Tier-A art.
 *
 * Composition: split hero → problem + visual → guide band → plan + diagram →
 * ornament → three cadence panels → contrast diptych → echo split → pricing → cta.
 */

export const metadata: Metadata = {
  title: `${SITE_NAME} — End the year proud, with proof`,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
}

export default function HomePage() {
  return (
    <div>
      <JsonLdScript data={buildSoftwareApplicationJsonLd()} />
      <Hero />
      <Problem />
      <Guide />
      <Plan />
      <OrnamentDivider variant="asterisk" className="container max-w-3xl mx-auto" />
      <FeaturesTeaser />
      <Contrast />
      <EchoBlock />
      <PricingTeaser />
      <CtaBand />
    </div>
  )
}
