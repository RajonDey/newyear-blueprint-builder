import { cn } from "@/lib/utils"

interface MandalaWatermarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
  position?: "center" | "top-right" | "bottom-left"
}

/* Hallmark · design-system: design.md · designed-as-app
 *
 * @deprecated Full-screen mandala wash is an "aurora-blob"-adjacent decoration
 * anti-pattern (design.md §10). The mandala motif now lives as
 * `<BrandMark size="sm | md | xl" />` for foreground brand usage and rare
 * ceremony moments only.
 *
 * Still used by:
 *   - `src/app/(marketing)/blog/page.tsx` (top-right wash)
 *   - `src/app/(marketing)/blog/[slug]/page.tsx` (top-right wash)
 *
 * Scheduled for removal in Wave F (content redesign). Do not use this
 * component on any new surface.
 */
export function MandalaWatermark({
  className,
  size = "md",
  position = "center",
}: MandalaWatermarkProps) {
  const sizeMap = { sm: "w-48 h-48", md: "w-80 h-80", lg: "w-[500px] h-[500px]" }
  const posMap = {
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "top-right": "right-0 top-0 translate-x-1/4 -translate-y-1/4",
    "bottom-left": "left-0 bottom-0 -translate-x-1/4 translate-y-1/4",
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute opacity-[0.04]",
        sizeMap[size],
        posMap[position],
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Concentric rings */}
        <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="200" cy="200" r="70" stroke="currentColor" strokeWidth="0.4" />
        <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="15" fill="currentColor" opacity="0.3" />

        {/* Cardinal points */}
        <circle cx="200" cy="10" r="8" fill="currentColor" opacity="0.25" />
        <circle cx="200" cy="390" r="8" fill="currentColor" opacity="0.25" />
        <circle cx="10" cy="200" r="8" fill="currentColor" opacity="0.25" />
        <circle cx="390" cy="200" r="8" fill="currentColor" opacity="0.25" />

        {/* Diagonal points */}
        <circle cx="66" cy="66" r="6" fill="currentColor" opacity="0.2" />
        <circle cx="334" cy="66" r="6" fill="currentColor" opacity="0.2" />
        <circle cx="66" cy="334" r="6" fill="currentColor" opacity="0.2" />
        <circle cx="334" cy="334" r="6" fill="currentColor" opacity="0.2" />

        {/* Axis lines */}
        <line x1="200" y1="10" x2="200" y2="390" stroke="currentColor" strokeWidth="0.3" />
        <line x1="10" y1="200" x2="390" y2="200" stroke="currentColor" strokeWidth="0.3" />
        <line x1="66" y1="66" x2="334" y2="334" stroke="currentColor" strokeWidth="0.2" />
        <line x1="334" y1="66" x2="66" y2="334" stroke="currentColor" strokeWidth="0.2" />

        {/* Inner ring dots */}
        <circle cx="200" cy="100" r="3" fill="currentColor" opacity="0.15" />
        <circle cx="200" cy="300" r="3" fill="currentColor" opacity="0.15" />
        <circle cx="100" cy="200" r="3" fill="currentColor" opacity="0.15" />
        <circle cx="300" cy="200" r="3" fill="currentColor" opacity="0.15" />
        <circle cx="130" cy="130" r="3" fill="currentColor" opacity="0.12" />
        <circle cx="270" cy="130" r="3" fill="currentColor" opacity="0.12" />
        <circle cx="130" cy="270" r="3" fill="currentColor" opacity="0.12" />
        <circle cx="270" cy="270" r="3" fill="currentColor" opacity="0.12" />
      </svg>
    </div>
  )
}
