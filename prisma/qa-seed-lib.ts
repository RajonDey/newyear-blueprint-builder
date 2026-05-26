import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  setISOWeek,
  subWeeks,
  subDays,
  subMonths,
} from "date-fns"
import type { LifeCategory, PrismaClient } from "@prisma/client"
import {
  areaHexByCategory,
  lifeCategoryLabels,
  lifeCategoryOrder,
} from "../src/lib/level-styles"
import {
  DEFAULT_MONTHLY_REVIEW_FIELDS,
  DEFAULT_QUARTERLY_REVIEW_FIELDS,
} from "../src/lib/review-templates"

/** Prefix on all seeded copy — used by unseed to find removable rows. */
export const QA_PREFIX = "[QA]"

export const QA_SEED_REFLECTIONS = {
  theme: "Momentum",
  qaSeed: true,
  qaSeedVersion: 1,
} as const

const DEFAULT_AREA_DESCRIPTIONS: Record<LifeCategory, string> = {
  HEALTH: "Body, mind, recovery, sleep.",
  CAREER: "Work, craft, learning, professional growth.",
  FINANCE: "Income, savings, investments, financial literacy.",
  RELATIONSHIPS: "Family, friendships, partners, community.",
  SPIRITUALITY: "Purpose, contemplation, gratitude, inner life.",
  PASSION: "Creative pursuits, hobbies, things that light you up.",
}

const DEFAULT_AREA_ICONS: Record<LifeCategory, string> = {
  HEALTH: "Heart",
  CAREER: "Briefcase",
  FINANCE: "Wallet",
  RELATIONSHIPS: "Users",
  SPIRITUALITY: "Sparkles",
  PASSION: "Star",
}

export function qa(label: string): string {
  return `${QA_PREFIX} ${label}`
}

export function parseEmail(): string {
  const email = (
    process.env.SEED_QA_EMAIL ??
    process.env.SEED_ADMIN_EMAILS?.split(",")[0] ??
    ""
  )
    .trim()
    .toLowerCase()
  if (!email) {
    throw new Error(
      "Set SEED_QA_EMAIL (or SEED_ADMIN_EMAILS) to the account that should receive QA data.",
    )
  }
  return email
}

export function shouldReset(): boolean {
  return process.env.SEED_QA_RESET === "true" || process.env.SEED_QA_RESET === "1"
}

export function dateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

export function getQuarterForDate(date: Date): "Q1" | "Q2" | "Q3" | "Q4" {
  const m = date.getMonth()
  if (m <= 2) return "Q1"
  if (m <= 5) return "Q2"
  if (m <= 8) return "Q3"
  return "Q4"
}

export function getIsoWeekContext(date: Date): { weekNumber: number; year: number } {
  return { weekNumber: getISOWeek(date), year: getISOWeekYear(date) }
}

export function getPreviousIsoWeek(
  weekNumber: number,
  year: number,
): { weekNumber: number; year: number } {
  const anchor = startOfISOWeek(
    setISOWeek(new Date(Date.UTC(year, 0, 4, 12, 0, 0)), weekNumber),
  )
  const prev = subWeeks(anchor, 1)
  return getIsoWeekContext(prev)
}

export async function ensureDefaultAreas(userId: string, prisma: PrismaClient) {
  for (let i = 0; i < lifeCategoryOrder.length; i++) {
    const category = lifeCategoryOrder[i]
    const existing = await prisma.area.findFirst({
      where: { userId, category, isDefault: true },
      select: { id: true },
    })
    if (existing) continue

    await prisma.area.create({
      data: {
        userId,
        name: lifeCategoryLabels[category],
        color: areaHexByCategory[category],
        icon: DEFAULT_AREA_ICONS[category],
        description: DEFAULT_AREA_DESCRIPTIONS[category],
        category,
        isDefault: true,
        sortOrder: i,
      },
    })
  }
}

export async function areaIdForCategory(
  userId: string,
  category: LifeCategory,
  prisma: PrismaClient,
): Promise<string> {
  const area = await prisma.area.findFirst({
    where: { userId, category, isDefault: true },
    select: { id: true },
  })
  if (!area) throw new Error(`Missing default area for ${category}`)
  return area.id
}

export function pastWeekContexts(count: number): { weekNumber: number; year: number }[] {
  const now = new Date()
  const contexts: { weekNumber: number; year: number }[] = []
  let { weekNumber, year } = getIsoWeekContext(now)

  for (let i = 0; i < count; i++) {
    contexts.push({ weekNumber, year })
    ;({ weekNumber, year } = getPreviousIsoWeek(weekNumber, year))
  }

  return contexts
}

export function pastDailyDates(count: number): Date[] {
  const dates: Date[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    dates.push(dateOnly(subDays(today, i)))
  }
  return dates
}

export function previousMonthContext(): { month: number; year: number } {
  const prev = subMonths(new Date(), 1)
  return { month: prev.getMonth() + 1, year: prev.getFullYear() }
}

export function currentMonthContext(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

export function previousQuarter(): "Q1" | "Q2" | "Q3" | "Q4" {
  const order = ["Q1", "Q2", "Q3", "Q4"] as const
  const current = getQuarterForDate(new Date())
  const idx = order.indexOf(current)
  return order[(idx + 3) % 4]
}

export { DEFAULT_MONTHLY_REVIEW_FIELDS, DEFAULT_QUARTERLY_REVIEW_FIELDS }
