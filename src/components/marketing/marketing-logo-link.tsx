import Link from "next/link"
import { cn } from "@/lib/utils"

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      className={cn("shrink-0 text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="14" cy="14" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="14" cy="14" r="2.5" fill="currentColor" opacity="0.4" />
      <line x1="14" y1="2" x2="14" y2="26" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <line x1="2" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

export function MarketingLogoLink({
  className,
  iconClassName,
  textClassName,
  size = "header",
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
  size?: "header" | "compact" | "auth"
}) {
  const iconSizes = {
    header: "h-7 w-7",
    compact: "h-6 w-6",
    auth: "h-8 w-8",
  }
  const textSizes = {
    header: "text-xl",
    compact: "text-lg",
    auth: "text-2xl",
  }

  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className
      )}
    >
      <LogoIcon className={cn(iconSizes[size], iconClassName)} />
      <span
        className={cn(
          "font-display font-semibold tracking-wide text-foreground",
          textSizes[size],
          textClassName
        )}
      >
        YearInReview
      </span>
    </Link>
  )
}
