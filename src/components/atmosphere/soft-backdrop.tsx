interface SoftBackdropProps {
  /**
   * `soft`  — used behind heroes (visible warm wash + faint rings).
   * `quiet` — used behind secondary pages (barely-there atmosphere).
   */
  intensity?: "soft" | "quiet"
  className?: string
}

/**
 * Soft, non-interactive atmosphere layer.
 *
 * A faint warm wash + slowly drifting concentric orbits and a quiet
 * sacred-geometry "seed of life" — meant to be felt, not seen.
 *
 * Anchored to the nearest positioned ancestor — wrap the parent in `relative`.
 *
 * Respects `prefers-reduced-motion`. No JS, no client hydration — pure SVG + CSS.
 */
export function SoftBackdrop({
  intensity = "soft",
  className = "",
}: SoftBackdropProps) {
  const washOpacity = intensity === "soft" ? 0.05 : 0.025
  const ringOpacity = intensity === "soft" ? 0.09 : 0.05
  const petalOpacity = intensity === "soft" ? 0.06 : 0.035

  const rings = [120, 200, 290, 395, 520, 670, 840]

  const SEED_R = 110
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return { cx: Math.cos(a) * SEED_R, cy: Math.sin(a) * SEED_R }
  })

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Warm radial wash, two layers for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(40% 50% at 50% 38%, hsl(var(--amber) / ${washOpacity}) 0%, transparent 70%),
            radial-gradient(70% 60% at 50% 100%, hsl(var(--amber) / ${washOpacity * 0.6}) 0%, transparent 70%)
          `,
        }}
      />

      {/* Drifting orbits — long, slow rotation; barely perceptible */}
      <svg
        className="sb-rings absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
        width="1200"
        height="1200"
        viewBox="-600 -600 1200 1200"
        fill="none"
        style={{ opacity: ringOpacity }}
      >
        {rings.map((r, i) => (
          <circle
            key={r}
            cx="0"
            cy="0"
            r={r}
            stroke="hsl(var(--foreground))"
            strokeWidth={0.4}
            strokeDasharray={i % 2 === 0 ? "none" : "2 6"}
            strokeOpacity={1 - i * 0.08}
          />
        ))}
      </svg>

      {/* Seed of life — drifts in the opposite direction */}
      <svg
        className="sb-seed absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
        width="520"
        height="520"
        viewBox="-260 -260 520 520"
        fill="none"
        style={{ opacity: petalOpacity }}
      >
        <circle cx="0" cy="0" r={SEED_R} stroke="hsl(var(--amber))" strokeWidth="0.6" />
        {petals.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={SEED_R}
            stroke="hsl(var(--amber))"
            strokeWidth="0.6"
          />
        ))}
      </svg>

      {/* A single tiny breathing seed at the center */}
      <span
        className="sb-seed-dot absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 5,
          height: 5,
          background: "hsl(var(--amber))",
          boxShadow: "0 0 12px hsl(var(--amber) / 0.5)",
          opacity: 0.55,
        }}
      />

      <style>{`
        @keyframes sb-rotate-cw  { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes sb-rotate-ccw { to { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes sb-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1);   opacity: .45; }
          50%      { transform: translate(-50%, -50%) scale(1.6); opacity: .7;  }
        }
        .sb-rings    { transform-origin: center; animation: sb-rotate-cw  240s linear infinite; }
        .sb-seed     { transform-origin: center; animation: sb-rotate-ccw 360s linear infinite; }
        .sb-seed-dot { animation: sb-breathe 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sb-rings, .sb-seed, .sb-seed-dot { animation: none; }
        }
      `}</style>
    </div>
  )
}
