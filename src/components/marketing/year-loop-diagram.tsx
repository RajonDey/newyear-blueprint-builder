"use client"

import { useSyncExternalStore, type ReactNode } from "react"
import { getCurrentYear } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Plan section — four-move year loop with orbit motion + flow arcs (§6 Tier-A).
 */

const CX = 200
const CY = 200
const ORBIT_R = 150
const INNER_R = 110

const NODES = [
  { n: "01", word: "Reflect", angle: -90, nodeR: 34 },
  { n: "02", word: "Plan", angle: 0, nodeR: 28 },
  { n: "03", word: "Live", angle: 90, nodeR: 28 },
  { n: "04", word: "Review", angle: 180, nodeR: 34 },
] as const

function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  }
}

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

export function YearLoopDiagram() {
  const year = getCurrentYear()
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[380px]"
    >
      <div className="absolute inset-[18%] rounded-full border border-border/60" />

      <svg viewBox="0 0 400 400" className="relative h-full w-full" fill="none">
        {/* Outer orbit ring */}
        <circle
          cx={CX}
          cy={CY}
          r={ORBIT_R}
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* Inner dashed ring — slow rotation */}
        <OrbitSpin cx={CX} cy={CY} dur="55s" reverse reducedMotion={reducedMotion}>
          <circle
            cx={CX}
            cy={CY}
            r={INNER_R}
            stroke="hsl(var(--amber) / 0.3)"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
        </OrbitSpin>

        {/* Flow arcs between steps — marching dash when motion allowed */}
        {NODES.map((node, i) => {
          const next = NODES[(i + 1) % NODES.length]
          const a = polar(node.angle, ORBIT_R)
          const b = polar(next.angle, ORBIT_R)
          return (
            <path
              key={`arc-${node.word}`}
              d={`M ${a.x} ${a.y} A ${ORBIT_R} ${ORBIT_R} 0 0 1 ${b.x} ${b.y}`}
              stroke="hsl(var(--amber) / 0.4)"
              strokeWidth="1.5"
              strokeDasharray="6 10"
              className={reducedMotion ? undefined : "loop-flow-arc"}
            />
          )
        })}

        {/* Traveling dots on orbits */}
        <OrbitSpin cx={CX} cy={CY} dur="34s" reducedMotion={reducedMotion}>
          <circle
            cx={CX}
            cy={CY - ORBIT_R}
            r="5"
            fill="hsl(var(--amber))"
            opacity="0.85"
          />
          <circle
            cx={CX + ORBIT_R * 0.7}
            cy={CY + ORBIT_R * 0.7}
            r="3"
            fill="hsl(var(--amber))"
            opacity="0.45"
          />
        </OrbitSpin>

        <OrbitSpin cx={CX} cy={CY} dur="24s" reverse reducedMotion={reducedMotion}>
          <circle
            cx={CX}
            cy={CY - INNER_R}
            r="3.5"
            fill="hsl(var(--amber))"
            opacity="0.55"
          />
        </OrbitSpin>

        {/* Step nodes */}
        {NODES.map((node) => {
          const { x, y } = polar(node.angle, ORBIT_R)
          const fontSize = node.nodeR >= 34 ? 11 : 12
          return (
            <g key={node.word}>
              <circle
                cx={x}
                cy={y}
                r={node.nodeR}
                fill="hsl(var(--background))"
                stroke="hsl(var(--border))"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y - (node.nodeR >= 34 ? 5 : 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--amber))"
                fontSize="10"
                fontFamily="var(--font-display)"
              >
                {node.n}
              </text>
              <text
                x={x}
                y={y + (node.nodeR >= 34 ? 7 : 6)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--foreground))"
                fontSize={fontSize}
                fontFamily="var(--font-display)"
              >
                {node.word}
              </text>
            </g>
          )
        })}

        {/* Center — dynamic year */}
        <circle
          cx={CX}
          cy={CY}
          r="40"
          fill="hsl(var(--background))"
          stroke="hsl(var(--amber) / 0.35)"
          strokeWidth="1.5"
        />
        <text
          x={CX}
          y={CY + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--foreground))"
          fontSize="15"
          fontWeight="500"
          fontFamily="var(--font-display)"
        >
          {year}
        </text>
      </svg>
    </div>
  )
}
