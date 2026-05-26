import { BrandMark } from "@/components/shared/brand-mark"
import { getCurrentYear } from "@/lib/utils"

/* Hallmark · design-system: design.md · designed-as-app
 * Tier-A hero enrichment — mandala centerpiece + year orbit (§11).
 * Year sits at geometric center (dynamic via getCurrentYear). One slow outer-ring rotation.
 */

const ORBIT_NODES = [
  { x: 200, y: 54, label: "Plan", r: 20 },
  { x: 346, y: 200, label: "Live", r: 20 },
  { x: 200, y: 346, label: "Review", r: 26 },
  { x: 54, y: 200, label: "Reflect", r: 26 },
] as const

export function MarketingHeroVisual() {
  const year = getCurrentYear()

  return (
    <div
      aria-hidden
      className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-none"
    >
      <div className="absolute inset-[18%] rounded-full border border-border/70" />
      <div className="absolute inset-[28%] rounded-full border border-border/50" />
      <div className="absolute inset-[38%] rounded-full border border-amber/15" />

      {/* Rotating outer orbit */}
      <div className="art-orbit-spin pointer-events-none absolute inset-0">
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full text-amber/40"
          fill="none"
        >
          <circle
            cx="200"
            cy="200"
            r="168"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="8 12"
          />
          <circle cx="200" cy="32" r="5" fill="hsl(var(--amber))" opacity="0.85" />
          <circle cx="348" cy="248" r="3.5" fill="hsl(var(--amber))" opacity="0.45" />
        </svg>
      </div>

      {/* Static inner orbit + loop nodes */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full text-amber/35"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle
          cx="200"
          cy="200"
          r="132"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.6"
        />
        <circle cx="368" cy="200" r="3" fill="currentColor" />
        <circle cx="200" cy="368" r="3" fill="currentColor" />
        <circle cx="32" cy="200" r="3" fill="currentColor" />
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

      {/* Center — mandala with year pill at geometric center */}
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

      <div className="absolute -left-2 top-[18%] rounded-xl border border-border/70 bg-background px-3 py-2 md:left-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Weekly
        </p>
        <p className="font-display text-sm text-foreground">Rhythm</p>
      </div>
      <div className="absolute -right-1 bottom-[22%] rounded-xl border border-border/70 bg-background px-3 py-2 md:right-2">
        <p className="text-[10px] uppercase tracking-widest text-amber">Daily</p>
        <p className="font-display text-sm text-foreground">Today</p>
      </div>
    </div>
  )
}
