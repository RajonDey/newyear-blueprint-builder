import type { Metadata } from "next"
import { PricingPlans } from "@/components/marketing/pricing-plans"
import { PricingCompare } from "@/components/marketing/pricing-compare"
import { CtaBand } from "@/components/marketing/sections/cta-band"

/* Hallmark · design-system: design.md · designed-as-app
 * Pricing — Letter voice + F3 tabular spec sheet archetype (Wave E).
 */

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free is real — the whole loop, kept simple. Pro is for the year you want proof of.",
}

export default function PricingPage() {
  return (
    <>
      <section className="container pt-14 md:pt-20 pb-10 md:pb-14">
        <div className="max-w-xl">
          <p className="font-display italic text-lg md:text-xl text-muted-foreground">
            A note on price,
          </p>
          <h1 className="mt-6 font-display text-4xl md:text-5xl tracking-tight leading-[1.08] text-foreground">
            Free is genuinely useful — forever. Pro is for the year you want
            proof of.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed">
            We don&apos;t believe in bait-and-switch tiers. The whole loop lives
            on Free. Pro adds depth when you&apos;re ready for monthly reviews,
            analytics, and a Wrapped worth sharing.
          </p>
        </div>
      </section>

      <section className="container pb-16 md:pb-24">
        <PricingPlans />
      </section>

      <section className="container border-t border-border pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="max-w-xl mb-10">
          <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug">
            Everything in Free, plus depth in Pro.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Limits come from the same caps the app enforces — not marketing
            fiction.
          </p>
        </div>
        <PricingCompare />
      </section>

      <CtaBand />
    </>
  )
}
