import Link from "next/link"
import { BrandMark } from "@/components/shared/brand-mark"
import { cn } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Marketing logo — calm editorial wordmark with the BrandMark mandala glyph.
 * The ✦ Unicode glyph it replaced was an icon-voice tell (rendered differently
 * per OS, didn't match Lucide stroke). See design.md §10.
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
  const markSize = {
    header: "md",
    compact: "sm",
    auth: "md",
  } as const

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className,
      )}
      aria-label="YearInReview home"
    >
      <BrandMark size={markSize[size]} />
      <span
        className={cn(
          "font-display tracking-tight text-foreground leading-none",
          textSizes[size],
          textClassName,
        )}
      >
        YearInReview
      </span>
    </Link>
  )
}
