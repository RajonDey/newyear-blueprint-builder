"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { getCurrentYear } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Problem section visual — scattered drift + held orbit motion (§6 Tier-A exception).
 */

const SCATTERED = [
  { cx: 52, cy: 78, drift: "scatter-drift-1" },
  { cx: 124, cy: 42, drift: "scatter-drift-2" },
  { cx: 96, cy: 152, drift: "scatter-drift-3" },
  { cx: 172, cy: 98, drift: "scatter-drift-4" },
  { cx: 148, cy: 172, drift: "scatter-drift-5" },
  { cx: 214, cy: 58, drift: "scatter-drift-6" },
  { cx: 200, cy: 146, drift: "scatter-drift-7" },
  { cx: 252, cy: 112, drift: "scatter-drift-8" },
] as const

const HELD_CX = 160
const HELD_CY = 308
const OUTER_R = 78
const INNER_R = 52

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
}

function OrbitSpin({
  cx,
  cy,
  dur,
  reverse,
  children,
  reducedMotion,
}: {
  cx: number
  cy: number
  dur: string
  reverse?: boolean
  children: ReactNode
  reducedMotion: boolean
}) {
  if (reducedMotion) {
    return <g>{children}</g>
  }
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`${reverse ? 360 : 0} ${cx} ${cy}`}
        to={`${reverse ? 0 : 360} ${cx} ${cy}`}
        dur={dur}
        repeatCount="indefinite"
      />
      {children}
    </g>
  )
}

export function ScatterOrbitVisual() {
  const year = getCurrentYear()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl border border-border/70 lg:max-w-md xl:max-w-lg"
    >
      <svg viewBox="0 0 320 400" className="relative h-full w-full p-1">
        {/* ── Scattered ── */}
        <text
          x="24"
          y="34"
          fill="hsl(var(--muted-foreground))"
          fontSize="10"
          letterSpacing="0.14em"
          fontFamily="var(--font-sans)"
        >
          SCATTERED
        </text>
        <text
          x="24"
          y="52"
          fill="hsl(var(--muted-foreground) / 0.7)"
          fontSize="11"
          fontFamily="var(--font-display)"
          fontStyle="italic"
        >
          notes · tabs · good intentions
        </text>

        {SCATTERED.map((dot, i) => (
          <g
            key={i}
            className={reducedMotion ? undefined : dot.drift}
            style={{ transformOrigin: `${dot.cx}px ${dot.cy}px` }}
          >
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={i % 3 === 0 ? 5 : 4}
              fill="hsl(var(--muted-foreground) / 0.32)"
            />
          </g>
        ))}

        <line
          x1="20"
          y1="208"
          x2="300"
          y2="208"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* ── Held together ── */}
        <text
          x="24"
          y="236"
          fill="hsl(var(--amber))"
          fontSize="10"
          letterSpacing="0.14em"
          fontFamily="var(--font-sans)"
        >
          HELD TOGETHER
        </text>
        <text
          x="24"
          y="254"
          fill="hsl(var(--foreground) / 0.55)"
          fontSize="11"
          fontFamily="var(--font-display)"
          fontStyle="italic"
        >
          one year · one calm system
        </text>

        {/* Orbit rings */}
        <circle
          cx={HELD_CX}
          cy={HELD_CY}
          r={OUTER_R}
          stroke="hsl(var(--amber) / 0.35)"
          strokeWidth="1"
          strokeDasharray="5 7"
          fill="none"
        />
        <circle
          cx={HELD_CX}
          cy={HELD_CY}
          r={INNER_R}
          stroke="hsl(var(--border))"
          strokeWidth="1"
          fill="none"
        />

        {/* Outer ring — 4 dots orbiting */}
        <OrbitSpin
          cx={HELD_CX}
          cy={HELD_CY}
          dur="38s"
          reducedMotion={reducedMotion}
        >
          <circle cx={HELD_CX} cy={HELD_CY - OUTER_R} r="5" fill="hsl(var(--amber))" opacity="0.9" />
          <circle cx={HELD_CX + OUTER_R} cy={HELD_CY} r="4" fill="hsl(var(--amber))" opacity="0.65" />
          <circle cx={HELD_CX} cy={HELD_CY + OUTER_R} r="5" fill="hsl(var(--amber))" opacity="0.9" />
          <circle cx={HELD_CX - OUTER_R} cy={HELD_CY} r="4" fill="hsl(var(--amber))" opacity="0.65" />
        </OrbitSpin>

        {/* Inner ring — 2 dots, counter-orbit */}
        <OrbitSpin
          cx={HELD_CX}
          cy={HELD_CY}
          dur="26s"
          reverse
          reducedMotion={reducedMotion}
        >
          <circle cx={HELD_CX} cy={HELD_CY - INNER_R} r="3.5" fill="hsl(var(--amber))" opacity="0.5" />
          <circle cx={HELD_CX + INNER_R} cy={HELD_CY} r="3.5" fill="hsl(var(--amber))" opacity="0.5" />
        </OrbitSpin>

        {/* Center — year (static) */}
        <circle cx={HELD_CX} cy={HELD_CY} r="22" fill="hsl(var(--background))" stroke="hsl(var(--amber) / 0.35)" strokeWidth="1" />
        <text
          x={HELD_CX}
          y={HELD_CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--foreground))"
          fontSize="13"
          fontWeight="500"
          fontFamily="var(--font-display)"
        >
          {year}
        </text>
      </svg>
    </div>
  )
}
