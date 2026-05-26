import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Highlighted aside in Wisdom MDX: <Callout> or <Callout variant="tip"> */
export function Callout({
  children,
  variant = "note",
}: {
  children: React.ReactNode
  variant?: "note" | "tip"
}) {
  return (
    <aside
      className={cn(
        "my-8 rounded-lg border px-5 py-4 text-[0.95rem] leading-relaxed not-prose",
        variant === "tip"
          ? "border-accent/35 bg-accent/5 text-foreground"
          : "border-border/80 bg-muted/35 text-foreground"
      )}
    >
      {children}
    </aside>
  )
}

/** CTA block: <SignupCta /> */
export function SignupCta() {
  return (
    <div className="my-10 not-prose rounded-xl border border-border/80 bg-card/80 bg-lotus-corner px-6 py-8 text-center space-y-4">
      <p className="font-display text-lg font-semibold text-foreground">Turn reading into a real plan</p>
      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        YearInReview connects your yearly blueprint, weekly rhythm, and daily systems—free to start.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="font-display font-semibold tracking-wide">
          <Link href="/signup">Begin free</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/how-it-works">See how it works</Link>
        </Button>
      </div>
    </div>
  )
}

export const wisdomMdxComponents = {
  Callout,
  SignupCta,
}
