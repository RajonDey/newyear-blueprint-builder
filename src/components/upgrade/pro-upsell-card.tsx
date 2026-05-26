/* Hallmark · design-system: design.md · designed-as-app */

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProMark } from "@/components/atmosphere/pro-mark"
import { cn } from "@/lib/utils"

interface ProUpsellCardProps {
  eyebrow?: React.ReactNode
  feature?: string
  title: string
  description: string
  bullets?: string[]
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  highlight?: boolean
  className?: string
}

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
      <span className="inline-flex items-baseline gap-1.5 text-sm text-amber">
        <ProMark className="text-[0.85em]" />
        Pro · {feature}
      </span>
    ) : null)

  return (
    <section
      className={cn(
        "border p-6 md:p-8",
        highlight ? "border-amber/40 bg-amber-wash" : "border-border bg-card",
        className,
      )}
    >
      <div className="max-w-2xl">
        {resolvedEyebrow && <div className="mb-3">{resolvedEyebrow}</div>}
        <h2 className="font-display text-2xl md:text-3xl tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
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
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
