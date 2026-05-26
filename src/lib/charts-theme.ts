/**
 * Shared recharts theme.
 *
 * Every chart in the app — Wheel of Life radar, analytics lines, habit
 * heatmaps, Wrapped slides — pulls its colors and axis defaults from here.
 *
 * Why: previously, each chart hardcoded its own `stroke="#…"` values, which
 * drifted from the brand palette and broke under dark mode. By referencing
 * CSS variables (resolved at runtime by the browser), charts inherit theme
 * changes for free.
 *
 * @example
 * ```tsx
 * import { chartColors, axisDefaults } from "@/lib/charts-theme"
 *
 * <Radar
 *   dataKey="value"
 *   stroke={chartColors.amber}
 *   fill={chartColors.amber}
 *   fillOpacity={0.28}
 *   strokeWidth={2}
 * />
 * <PolarGrid stroke={chartColors.border} />
 * <PolarAngleAxis dataKey="category" tick={axisDefaults.tick} />
 * ```
 */

/**
 * CSS-variable–backed color tokens.
 *
 * IMPORTANT: these strings are valid CSS `hsl()` references. recharts accepts
 * any valid CSS color string for `stroke` / `fill`, so we don't need to
 * resolve the HSL ourselves.
 */
export const chartColors = {
  amber: "hsl(var(--amber))",
  amberSoft: "hsl(var(--amber) / 0.35)",
  amberWash: "hsl(var(--amber) / 0.08)",
  ink: "hsl(var(--foreground))",
  inkSoft: "hsl(var(--foreground) / 0.6)",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
  card: "hsl(var(--card))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
} as const

/**
 * Ordered series palette for multi-series charts.
 * Index 0 = primary (amber), 1 = ink, 2 = soft amber, etc.
 * Keep this list short — calm dashboards rarely need > 4 series.
 */
export const chartSeries = [
  chartColors.amber,
  chartColors.ink,
  chartColors.amberSoft,
  chartColors.inkSoft,
] as const

/** Default props for `<XAxis>`, `<YAxis>`, `<PolarAngleAxis>` etc. */
export const axisDefaults = {
  tick: {
    fill: chartColors.muted,
    fontSize: 12,
  },
  tickLine: false,
  axisLine: { stroke: chartColors.border },
} as const

/** Default props for `<CartesianGrid>` / `<PolarGrid>`. */
export const gridDefaults = {
  stroke: chartColors.border,
  strokeDasharray: "2 4",
} as const

/** Default tooltip styling for `<Tooltip>` (recharts). */
export const tooltipDefaults = {
  contentStyle: {
    background: chartColors.card,
    border: `1px solid ${chartColors.border}`,
    borderRadius: 12,
    padding: "8px 12px",
    fontSize: 12,
    color: chartColors.ink,
    boxShadow: "0 2px 12px hsl(var(--foreground) / 0.06)",
  },
  itemStyle: {
    color: chartColors.ink,
  },
  labelStyle: {
    color: chartColors.muted,
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  },
} as const
