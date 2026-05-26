"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { BrandMark } from "@/components/shared/brand-mark"
import { getCurrentYear } from "@/lib/utils"
import { cn } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Auth Tier-A art — mirrors homepage orbit, minimal fills, motion (§6, §11).
 */

const CX = 200
const CY = 200

const ORBIT_NODES = [
  { x: 200, y: 54, label: "Plan", r: 20 },
  { x: 346, y: 200, label: "Live", r: 20 },
  { x: 200, y: 346, label: "Review", r: 26 },
  { x: 54, y: 200, label: "Reflect", r: 26 },
] as const

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
  reducedMotion,
  children,
}: {
  cx: number
  cy: number
  dur: string
  reverse?: boolean
  reducedMotion: boolean
  children: ReactNode
}) {
  if (reducedMotion) return <g>{children}</g>
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

type AuthLetterVisualProps = {
  className?: string
}

export function AuthLetterVisual({ className }: AuthLetterVisualProps) {
  const year = getCurrentYear()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-6 md:items-end",
        className,
      )}
    >
      <div
        aria-hidden
        className="relative aspect-square w-full max-w-[380px]"
      >
        <div className="absolute inset-[18%] rounded-full border border-border/70" />
        <div className="absolute inset-[28%] rounded-full border border-border/50" />
        <div className="absolute inset-[38%] rounded-full border border-amber/15" />

        {/* CSS spin — outer dashed ring */}
        <div className="art-orbit-spin pointer-events-none absolute inset-0">
          <svg viewBox="0 0 400 400" className="h-full w-full text-amber/40" fill="none">
            <circle
              cx={CX}
              cy={CY}
              r="168"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 12"
            />
            <circle cx={CX} cy="32" r="5" fill="hsl(var(--amber))" opacity="0.85" />
            <circle cx="348" cy="248" r="3.5" fill="hsl(var(--amber))" opacity="0.45" />
          </svg>
        </div>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-amber/35"
          viewBox="0 0 400 400"
          fill="none"
        >
          {/* Inner dashed ring — slow counter-rotation */}
          <OrbitSpin cx={CX} cy={CY} dur="50s" reverse reducedMotion={reducedMotion}>
            <circle
              cx={CX}
              cy={CY}
              r="132"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeDasharray="4 8"
              opacity="0.55"
            />
          </OrbitSpin>

          <circle cx="368" cy={CY} r="3" fill="currentColor" />
          <circle cx={CX} cy="368" r="3" fill="currentColor" />
          <circle cx="32" cy={CY} r="3" fill="currentColor" />

          {/* Traveling dot on main orbit */}
          <OrbitSpin cx={CX} cy={CY} dur="36s" reducedMotion={reducedMotion}>
            <circle cx={CX} cy={CY - 168} r="4.5" fill="hsl(var(--amber))" opacity="0.8" />
          </OrbitSpin>

          {ORBIT_NODES.map((node) => (
            <g key={node.label}>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.r}
                fill="hsl(var(--background))"
                stroke="currentColor"
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--amber))"
                fontSize={node.r >= 26 ? 10.5 : 11}
                fontFamily="var(--font-display)"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Center — year on mandala */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-[88px] w-[88px] items-center justify-center">
            <BrandMark size="xl" className="absolute inset-0 m-auto opacity-90" />
            <div className="relative z-10 rounded-full border border-amber/30 bg-background px-3.5 py-1">
              <span className="font-display text-base font-medium tracking-tight text-foreground tabular-nums">
                {year}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -left-1 top-[16%] rounded-xl border border-border/70 bg-background px-3 py-2 md:left-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Weekly
          </p>
          <p className="font-display text-sm text-foreground">Rhythm</p>
        </div>
        <div className="absolute -right-1 bottom-[20%] rounded-xl border border-border/70 bg-background px-3 py-2 md:right-0">
          <p className="text-[10px] uppercase tracking-widest text-amber">Daily</p>
          <p className="font-display text-sm text-foreground">Today</p>
        </div>
      </div>

      <p className="font-display text-base italic text-muted-foreground max-w-[26ch] text-center leading-snug text-pretty md:text-right">
        One calm place for the year you&apos;re building
      </p>
    </div>
  )
}
