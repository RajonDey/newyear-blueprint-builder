import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProMark } from "@/components/atmosphere/pro-mark"
import { cn } from "@/lib/utils"

interface ProUpsellCardProps {
  /** Editorial kicker over the title. Defaults to "Pro · {feature}" when `feature` is set. */
  eyebrow?: React.ReactNode
  /** Name of the gated feature, used in the default eyebrow if `eyebrow` is omitted. */
  feature?: string
  /** Display title. */
  title: string
  /** Supporting body copy. Keep to one or two sentences. */
  description: string
  /** Optional list of value-prop bullets shown beneath the description. */
  bullets?: string[]
  /** Primary CTA. */
  ctaLabel?: string
  ctaHref?: string
  /** Optional secondary CTA. */
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  /** Use the highlighted (amber-tinted) variant. Default `true`. */
  highlight?: boolean
  className?: string
}

/**
 * Editorial Pro-upgrade card used as the fallback inside `<ProGate>` and as a
 * standalone in-page upsell (e.g. on `/anti-goals` when at cap, on `/wrapped`
 * for Free users).
 *
 * Visual language matches the marketing pricing cards (rounded-3xl, amber
 * gradient tint, ProMark glyph) so Free → Pro flows feel continuous.
 */
export function ProUpsellCard({
  eyebrow,
  feature,
  title,
  description,
  bullets,
  ctaLabel = "Upgrade to Pro",
  ctaHref = "/settings#billing",
  secondaryCtaLabel = "See pricing",
  secondaryCtaHref = "/pricing",
  highlight = true,
  className,
}: ProUpsellCardProps) {
  const resolvedEyebrow =
    eyebrow ??
    (feature ? (
      <span className="inline-flex items-baseline gap-1.5">
        <ProMark className="text-[0.85em]" />
        Pro · {feature}
      </span>
    ) : null)

  return (
    <section
      className={cn(
        "relative rounded-3xl border p-8 md:p-10",
        highlight
          ? "border-amber/40 bg-gradient-to-br from-amber/[0.06] via-card to-card shadow-sm"
          : "border-border bg-card",
        className,
      )}
    >
      <div className="max-w-2xl">
        {resolvedEyebrow && (
          <div className="text-[10px] font-semibold tracking-[0.28em] uppercase text-amber mb-4">
            {resolvedEyebrow}
          </div>
        )}
        <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-[1.1]">
          {title}
        </h2>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          {description}
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 text-sm text-foreground/85"
              >
                <span
                  aria-hidden
                  className="mt-1.5 h-1 w-1 rounded-full bg-amber shrink-0"
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button asChild className="gap-2">
            <Link href={ctaHref}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryCtaLabel && secondaryCtaHref && (
            <Button variant="ghost" asChild>
              <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
