/**
 * Shared visual language for the three PARA tiers — Area → Project → Task.
 *
 * Used everywhere the spine appears so users can tell which level they're
 * looking at by shape, weight, and color before reading. Ported from the
 * Lovable (YIR) design language and adapted to NBB's `LifeCategory` enum.
 */
import {
  Activity,
  Briefcase,
  Heart,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { LifeCategory } from "@prisma/client"

export const lifeCategoryLabels: Record<LifeCategory, string> = {
  HEALTH: "Health",
  CAREER: "Career",
  FINANCE: "Finance",
  RELATIONSHIPS: "Relationships",
  SPIRITUALITY: "Spirituality",
  PASSION: "Passion",
}

export const lifeCategoryOrder: LifeCategory[] = [
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
]

export const lifeCategoryHints: Record<LifeCategory, { hint: string; example: string }> = {
  HEALTH: {
    hint: "Energy, sleep, body, training base.",
    example: "1 = depleted · 10 = vital and resilient",
  },
  CAREER: {
    hint: "Craft, contribution, trajectory.",
    example: "1 = drifting · 10 = compounding deeply",
  },
  FINANCE: {
    hint: "Runway, savings, calm with money.",
    example: "1 = anxious · 10 = quiet and free",
  },
  RELATIONSHIPS: {
    hint: "Presence with the people who matter.",
    example: "1 = absent · 10 = nourishing both ways",
  },
  SPIRITUALITY: {
    hint: "Stillness, meaning, alignment.",
    example: "1 = scattered · 10 = grounded and clear",
  },
  PASSION: {
    hint: "Play, curiosity, the side craft.",
    example: "1 = all output · 10 = alive and curious",
  },
}

/** Lucide icon per category. Used in area cards, area detail, project chips. */
export const areaIcon: Record<LifeCategory, LucideIcon> = {
  HEALTH: Activity,
  CAREER: Briefcase,
  FINANCE: Wallet,
  RELATIONSHIPS: Heart,
  SPIRITUALITY: Sparkles,
  PASSION: Users,
}

/**
 * HSL hues per category, sampled to feel calm against the ivory background.
 * Used as a CSS variable so opacity tweaks are easy at call sites.
 *
 * `hsl(${areaHue.HEALTH} / 0.12)` → background wash
 * `hsl(${areaHue.HEALTH})`        → solid icon color
 */
export const areaHue: Record<LifeCategory, string> = {
  HEALTH: "152 45% 45%",
  CAREER: "215 40% 50%",
  FINANCE: "35 70% 50%",
  RELATIONSHIPS: "350 55% 55%",
  SPIRITUALITY: "265 40% 55%",
  PASSION: "20 70% 55%",
}

/** Hex equivalents — used when seeding `Area.color` rows in the DB. */
export const areaHexByCategory: Record<LifeCategory, string> = {
  HEALTH: "#22c55e",
  CAREER: "#3b82f6",
  FINANCE: "#f59e0b",
  RELATIONSHIPS: "#ec4899",
  SPIRITUALITY: "#a855f7",
  PASSION: "#d4a05c",
}

/** Tailwind class bundles per spine level. Keep visually distinct. */
export const levelStyles = {
  area: {
    container:
      "rounded-2xl border border-border/70 bg-card hover:bg-card/80 transition-colors",
    title: "font-display text-xl tracking-tight",
    eyebrow: "text-[10px] uppercase tracking-widest text-muted-foreground",
  },
  project: {
    container:
      "rounded-xl border border-border/70 bg-background/60 hover:bg-background transition-colors",
    title: "font-medium text-sm leading-snug",
    eyebrow: "text-[10px] uppercase tracking-wider text-muted-foreground",
    /** Left accent border in the parent area's color. */
    accent: (cat: LifeCategory) => ({
      borderLeftWidth: "3px",
      borderLeftColor: `hsl(${areaHue[cat]} / 0.65)`,
    }),
  },
  task: {
    container:
      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50",
    title: "text-sm",
  },
} as const
