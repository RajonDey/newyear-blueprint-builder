import { cn } from "@/lib/utils"

interface ProMarkProps {
  className?: string
}

/**
 * Tiny "Pro" badge — a star asterisk glyph used to mark Pro-only entry points.
 *
 * Inherits text color from its parent so it works on both ivory and ink surfaces.
 */
export function ProMark({ className }: ProMarkProps) {
  return (
    <span
      aria-label="Pro feature"
      className={cn(
        "inline-flex items-center justify-center text-amber leading-none",
        className,
      )}
    >
      <svg
        viewBox="-12 -12 24 24"
        fill="none"
        className="h-[1em] w-[1em]"
        aria-hidden
      >
        {[0, 60, 120].map((a) => (
          <line
            key={a}
            x1="-7"
            y1="0"
            x2="7"
            y2="0"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${a})`}
          />
        ))}
        <circle cx="0" cy="0" r="1.3" fill="currentColor" />
      </svg>
    </span>
  )
}
