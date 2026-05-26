import type { Metadata } from "next"
import { SoftBackdrop } from "@/components/atmosphere/soft-backdrop"
import { PricingPlans } from "@/components/marketing/pricing-plans"
import { PricingCompare } from "@/components/marketing/pricing-compare"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Free is real — the whole loop, kept simple. Pro is for the year you want proof of.",
}

export default function PricingPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="relative mx-auto w-full max-w-5xl px-6">
        <SoftBackdrop intensity="quiet" />

        <div className="relative">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
              Pricing
            </div>
            <h1 className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05]">
              Two ways to{" "}
              <em className="not-italic text-amber">end the year proud</em>.
            </h1>
            <p className="text-muted-foreground mt-5 text-base md:text-lg leading-relaxed">
              Free is genuinely useful — forever. Pro is for the year you want
              proof of.
            </p>
          </div>

          <PricingPlans />

          <div className="mt-24">
            <div className="text-center mb-8">
              <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-3">
                Compare
              </div>
              <h2 className="font-display text-3xl md:text-4xl tracking-tight">
                Everything in Free, plus depth in Pro.
              </h2>
            </div>
            <PricingCompare />
          </div>
        </div>
      </div>
    </section>
  )
}
