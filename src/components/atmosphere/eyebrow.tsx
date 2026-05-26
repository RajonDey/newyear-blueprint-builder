import { cn } from "@/lib/utils"

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

/**
 * Small uppercase amber kicker text used above section titles.
 *
 * Borrowed from the Lovable design language — sets a calm, editorial tone
 * by signalling section intent before the headline.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        "text-[11px] font-semibold tracking-[0.18em] uppercase text-accent",
        className,
      )}
    >
      {children}
    </div>
  )
}
