import Link from "next/link"
import { cn } from "@/lib/utils"

/**
 * Marketing logo — calm editorial wordmark with the amber spark glyph.
 *
 * Adopted from the Lovable design language: a small amber asterisk to the left
 * of the wordmark replaces the older mandala compass icon.
 */
export function MarketingLogoLink({
  className,
  textClassName,
  size = "header",
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
  size?: "header" | "compact" | "auth"
}) {
  const textSizes = {
    header: "text-lg",
    compact: "text-base",
    auth: "text-2xl",
  }
  const sparkSizes = {
    header: "text-base",
    compact: "text-sm",
    auth: "text-xl",
  }

  return (
    <Link
      href="/"
      className={cn(
        "flex items-baseline gap-2 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className,
      )}
      aria-label="YearInReview home"
    >
      <span
        aria-hidden
        className={cn("text-amber leading-none", sparkSizes[size])}
      >
        ✦
      </span>
      <span
        className={cn(
          "font-display tracking-tight text-foreground",
          textSizes[size],
          textClassName,
        )}
      >
        YearInReview
      </span>
    </Link>
  )
}
