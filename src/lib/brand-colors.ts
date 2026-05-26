/* Hallmark · design-system: design.md · brand static assets */

/** Hex values for SVG / OG images (match globals.css paper + amber + ink). */
export const brandColors = {
  paper: "#FAF8F5",
  paperDeep: "#F0EBE3",
  amber: "#E58A3C",
  ink: "#1C2433",
  inkSoft: "#5C4D3C",
  muted: "#7A6A58",
} as const

/** Concentric ring radii in BrandMark viewBox units (-50…50). */
export const brandMarkRings = {
  sm: [42, 26] as const,
  md: [42, 30, 18] as const,
} as const

export function brandMarkSvg({
  rings,
  strokeWidth,
  size = 32,
  background = brandColors.paper,
  foreground = brandColors.amber,
}: {
  rings: readonly number[]
  strokeWidth: number
  size?: number
  background?: string
  foreground?: string
}) {
  const circles = rings
    .map(
      (r) =>
        `<circle cx="0" cy="0" r="${r}" stroke="${foreground}" stroke-width="${strokeWidth}" fill="none"/>`,
    )
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-50 -50 100 100" fill="none"><rect x="-50" y="-50" width="100" height="100" fill="${background}"/>${circles}<circle cx="0" cy="0" r="2.5" fill="${foreground}"/></svg>`
}
