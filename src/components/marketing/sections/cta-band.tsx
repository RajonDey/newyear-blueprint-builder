import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBand() {
  return (
    <section className="container py-24 md:py-32">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 md:py-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber/[0.05] via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-2xl">
          <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
            One year. One system.
          </div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight leading-[1.05]">
            End this year proud — <em className="not-italic text-amber">with proof</em>.
          </h2>
          <p className="text-muted-foreground mt-5 text-base md:text-lg leading-relaxed">
            The plan, the rhythm, and the daily systems — held together calmly, so
            you actually get there.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/signup">
                Begin your year — free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <div className="mt-5 text-xs text-muted-foreground">
            No card required · Export anytime · Calm by design
          </div>
        </div>
      </div>
    </section>
  )
}
