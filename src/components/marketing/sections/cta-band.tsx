import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/* Hallmark · design-system: design.md · designed-as-app
 * CTA band — warm full-width close with visible button.
 */

export function CtaBand() {
  return (
    <section className="border-t border-amber/20 bg-amber-wash">
      <div className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display italic text-2xl md:text-4xl text-foreground leading-[1.15] tracking-tight">
            One year. One system.
            <br />
            End it proud — with proof.
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Free to start, no card, export anytime.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">
                Begin your year
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
