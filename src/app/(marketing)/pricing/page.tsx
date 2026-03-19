import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OrnamentDivider } from "@/components/shared/ornament-divider"
import { MandalaWatermark } from "@/components/shared/mandala-watermark"
import { Check, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, mindful pricing for your annual planning journey.",
}

const freeFeatures = [
  "Full planning wizard",
  "Up to 3 intentional goals",
  "Weekly check-ins",
  "Basic streak tracking",
  "Wheel of Life assessment",
  "PDF export",
]

const proFeatures = [
  "Everything in Free",
  "Unlimited goals & categories",
  "Quarterly review wizard",
  "Advanced progress analytics",
  "AI Planning Coach",
  "Accountability sharing",
  "Streak shields (2 per quarter)",
  "Premium Year Wrapped",
]

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <MandalaWatermark size="lg" position="top-right" className="opacity-[0.025]" />
      <div className="container py-24">
        <div className="text-center space-y-4 mb-6">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-accent">
            Pricing
          </h2>
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground">
            Walk your path, at your pace
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Begin free. Grow when you're ready for deeper guidance.
          </p>
        </div>

        <OrnamentDivider variant="dot" className="max-w-xs mx-auto" />

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mt-8">
          {/* Free Tier */}
          <div className="rounded-lg border p-8 space-y-6 bg-card bg-lotus-corner">
            <div>
              <h3 className="text-xl font-display font-semibold">Free</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Everything you need to begin
              </p>
            </div>
            <p className="text-4xl font-display font-bold">
              $0
              <span className="text-base font-normal text-muted-foreground">
                /forever
              </span>
            </p>
            <ul className="space-y-3">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full">
                Begin Free
              </Button>
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="rounded-lg border-2 border-accent/40 p-8 space-y-6 relative bg-card">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Recommended
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold">Pro</h3>
              <p className="text-sm text-muted-foreground mt-1">
                For those committed to transformation
              </p>
            </div>
            <p className="text-4xl font-display font-bold">
              $49
              <span className="text-base font-normal text-muted-foreground">
                /year
              </span>
            </p>
            <ul className="space-y-3">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button className="w-full">Begin Your Journey</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
