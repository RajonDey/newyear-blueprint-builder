import type { Metadata } from "next"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
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
  title: "YearInReview — End the year proud, with proof",
  description:
    "A calm planning system that connects your yearly plan, weekly rhythm, and daily systems — so intentions turn into habits, not guilt.",
  openGraph: {
    title: "YearInReview — Design a life worth living",
    description:
      "One calm place where your yearly plan, weekly rhythm, and daily systems all live together.",
  },
}

export default function HomePage() {
  return (
    <div>
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
