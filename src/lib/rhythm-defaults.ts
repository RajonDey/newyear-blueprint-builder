export type RhythmTab = "plan" | "review"

export type MonthlyTabContext = {
  month: number
  year: number
  hasPlan: boolean
  hasReview: boolean
  now?: Date
}

export type WeeklyTabContext = {
  now?: Date
}

export type QuarterlyTabContext = {
  quarter: "Q1" | "Q2" | "Q3" | "Q4"
  year: number
  hasPlan: boolean
  hasReview: boolean
  now?: Date
}

/** First half of the month — bias toward planning. */
export const MONTHLY_PLAN_CUTOFF_DAY = 14

function parseExplicitTab(
  tab: string | string[] | undefined | null,
): RhythmTab | null {
  const v = Array.isArray(tab) ? tab[0] : tab
  if (v === "review") return "review"
  if (v === "plan") return "plan"
  return null
}

export function resolveDefaultMonthlyTab(ctx: MonthlyTabContext): RhythmTab {
  const now = ctx.now ?? new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  if (
    ctx.year < currentYear ||
    (ctx.year === currentYear && ctx.month < currentMonth)
  ) {
    return ctx.hasReview ? "review" : "plan"
  }

  if (
    ctx.year > currentYear ||
    (ctx.year === currentYear && ctx.month > currentMonth)
  ) {
    return "plan"
  }

  const day = now.getDate()
  if (day <= MONTHLY_PLAN_CUTOFF_DAY || !ctx.hasPlan) {
    return "plan"
  }
  if (ctx.hasReview) {
    return "review"
  }
  return "plan"
}

/** Mon–Wed → plan; Thu–Sun → review. */
export function resolveDefaultWeeklyTab(ctx?: WeeklyTabContext): RhythmTab {
  const now = ctx?.now ?? new Date()
  const day = now.getDay()
  if (day >= 1 && day <= 3) return "plan"
  return "review"
}

/** First two months of the quarter → plan; third month → review when plan exists. */
export function resolveDefaultQuarterlyTab(ctx: QuarterlyTabContext): RhythmTab {
  const now = ctx.now ?? new Date()
  const currentYear = now.getFullYear()
  const currentQuarter =
    (`Q${Math.floor(now.getMonth() / 3) + 1}` as QuarterlyTabContext["quarter"])

  const order = ["Q1", "Q2", "Q3", "Q4"] as const
  const qIdx = order.indexOf(ctx.quarter)
  const curIdx = order.indexOf(currentQuarter)

  if (ctx.year < currentYear || (ctx.year === currentYear && qIdx < curIdx)) {
    return ctx.hasReview ? "review" : "plan"
  }

  if (ctx.year > currentYear || (ctx.year === currentYear && qIdx > curIdx)) {
    return "plan"
  }

  const monthWithinQuarter = now.getMonth() % 3
  if (monthWithinQuarter < 2 || !ctx.hasPlan) {
    return "plan"
  }
  if (ctx.hasReview) {
    return "review"
  }
  return "plan"
}

export function resolveMonthlyWorkspaceTab(
  tabParam: string | null,
  ctx: MonthlyTabContext,
): RhythmTab {
  return parseExplicitTab(tabParam) ?? resolveDefaultMonthlyTab(ctx)
}

export function resolveWeeklyWorkspaceTab(
  tabParam: string | null | undefined,
  ctx?: WeeklyTabContext,
): RhythmTab {
  return parseExplicitTab(tabParam) ?? resolveDefaultWeeklyTab(ctx)
}

export function resolveQuarterlyWorkspaceTab(
  tabParam: string | null,
  ctx: QuarterlyTabContext,
): RhythmTab {
  return parseExplicitTab(tabParam) ?? resolveDefaultQuarterlyTab(ctx)
}
