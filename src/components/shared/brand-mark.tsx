import { cn } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * The single brand mark for YearInReview (design.md §10).
 *
 * Replaces four prior implementations:
 *   - ✦ Unicode glyph (marketing nav · auth header · hero badge · footer)
 *   - "Y" letter tile (app sidebar)
 *   - MandalaWatermark full-screen SVG (auth layout · blog pages — to migrate)
 *   - bg-lotus-corner CSS utility (login card · blog · wisdom MDX — to migrate)
 *
 * Three sizes, three jobs:
 *   sm (16px) — inline body glyph (hero badge, footer signature)
 *   md (24px) — standard brand mark (nav, auth header, app sidebar)
 *   xl (80px) — rare ceremony mark (onboarding completion · year-wrapped header)
 *
 * No motion. Ever. The mark is static and earns its weight from restraint.
 */

interface BrandMarkProps {
  size?: "sm" | "md" | "xl"
  /**
   * Decorative by default (`aria-hidden`). Pass a label when the mark stands
   * alone without an accompanying "YearInReview" wordmark — Cursor: do this
   * sparingly, almost always render the mark alongside the wordmark.
   */
  label?: string
  className?: string
}

const sizeMap = {
  sm: { px: 16, stroke: 1.1, rings: 2 },
  md: { px: 24, stroke: 0.9, rings: 3 },
  xl: { px: 80, stroke: 0.6, rings: 5 },
} as const

export function BrandMark({
  size = "md",
  label,
  className,
}: BrandMarkProps) {
  const { px, stroke, rings } = sizeMap[size]
  const a11yProps = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const }

  /* Ring radii are derived from a 100-unit viewBox so the proportions hold at any size.
   * The outermost ring sits at r=42 (84% of the canvas) — enough breathing room for
   * antialiasing at 16px without clipping.
   */
  const ringRadii =
    rings === 2
      ? [42, 26]
      : rings === 3
        ? [42, 30, 18]
        : [42, 36, 28, 20, 12]

  /* xl gets the cardinal-point dots that gave the original mandala its compass feel.
   * sm and md keep just the rings + centre — clearer at small sizes.
   */
  const showCardinalDots = size === "xl"

  /* xl renders at --amber-emphasis (0.20) so it reads as ambient ceremony presence
   * rather than a logo staring at the reader. sm and md render fully opaque amber.
   */
  const opacity = size === "xl" ? 0.6 : 1

  return (
    <svg
      {...a11yProps}
      width={px}
      height={px}
      viewBox="-50 -50 100 100"
      fill="none"
      className={cn("shrink-0 text-amber", className)}
      style={{ opacity }}
    >
      {ringRadii.map((r) => (
        <circle
          key={r}
          cx="0"
          cy="0"
          r={r}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
        />
      ))}
      {showCardinalDots && (
        <>
          <circle cx="0" cy="-42" r="2" fill="currentColor" />
          <circle cx="0" cy="42" r="2" fill="currentColor" />
          <circle cx="-42" cy="0" r="2" fill="currentColor" />
          <circle cx="42" cy="0" r="2" fill="currentColor" />
        </>
      )}
      {/* Centre dot — anchors the composition at all three sizes */}
      <circle cx="0" cy="0" r={size === "sm" ? 2.5 : 3} fill="currentColor" />
    </svg>
  )
}
