import { db } from "@/lib/db"

export const EXPORT_VERSION = 1
export const MAX_EXPORT_ROWS = 10_000

export type UserExportBundle = {
  meta: {
    version: number
    exportedAt: string
    app: "yearinreview"
    rowCount: number
  }
  user: {
    id: string
    name: string | null
    email: string
    timezone: string
    planTier: string
    preferences: unknown
    createdAt: Date
    updatedAt: Date
  }
  areas: Awaited<ReturnType<typeof fetchAreas>>
  vision: Awaited<ReturnType<typeof fetchVision>>
  yearlyPlans: Awaited<ReturnType<typeof fetchYearlyPlans>>
  antiGoals: Awaited<ReturnType<typeof fetchAntiGoals>>
  wheel: Awaited<ReturnType<typeof fetchWheel>>
  projects: Awaited<ReturnType<typeof fetchProjects>>
  tasks: Awaited<ReturnType<typeof fetchTasks>>
  systems: Awaited<ReturnType<typeof fetchSystems>>
  notes: Awaited<ReturnType<typeof fetchNotes>>
  resources: Awaited<ReturnType<typeof fetchResources>>
  drifts: Awaited<ReturnType<typeof fetchDrifts>>
  dailyStates: Awaited<ReturnType<typeof fetchDailyStates>>
  checkIns: {
    weekly: Awaited<ReturnType<typeof fetchWeeklyCheckIns>>
    project: Awaited<ReturnType<typeof fetchProjectCheckIns>>
  }
  weeklyPlans: Awaited<ReturnType<typeof fetchWeeklyPlans>>
  monthlyPlans: Awaited<ReturnType<typeof fetchMonthlyPlans>>
  monthlyReviews: Awaited<ReturnType<typeof fetchMonthlyReviews>>
  quarterlyPlans: Awaited<ReturnType<typeof fetchQuarterlyPlans>>
  quarterlyReviews: Awaited<ReturnType<typeof fetchQuarterlyReviews>>
  streaks: Awaited<ReturnType<typeof fetchStreaks>>
  achievements: Awaited<ReturnType<typeof fetchAchievements>>
  reviewTemplates: Awaited<ReturnType<typeof fetchReviewTemplates>>
}

export class ExportTooLargeError extends Error {
  constructor(public rowCount: number) {
    super(`Export exceeds ${MAX_EXPORT_ROWS} rows`)
    this.name = "ExportTooLargeError"
  }
}

function fetchAreas(userId: string) {
  return db.area.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  })
}

function fetchVision(userId: string) {
  return db.vision.findUnique({
    where: { userId },
    include: { items: { orderBy: { order: "asc" } } },
  })
}

function fetchYearlyPlans(userId: string) {
  return db.yearlyPlan.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  })
}

function fetchAntiGoals(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.antiGoal.findMany({ where: { planId: { in: planIds } } })
}

function fetchWheel(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.wheelOfLifeEntry.findMany({
    where: { planId: { in: planIds } },
    orderBy: { recordedAt: "asc" },
  })
}

function fetchProjects(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.project.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
}

function fetchTasks(projectIds: string[]) {
  if (projectIds.length === 0) return Promise.resolve([])
  return db.task.findMany({ where: { projectId: { in: projectIds } } })
}

function fetchSystems(projectIds: string[]) {
  if (projectIds.length === 0) return Promise.resolve([])
  return db.system.findMany({
    where: { projectId: { in: projectIds } },
    include: { completions: { orderBy: { date: "asc" } } },
  })
}

function fetchNotes(userId: string) {
  return db.note.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })
}

/** File resources export metadata only — no blob download. */
function fetchResources(userId: string) {
  return db.resource.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      parentType: true,
      parentId: true,
      kind: true,
      title: true,
      url: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })
}

function fetchDrifts(userId: string) {
  return db.drift.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })
}

function fetchDailyStates(userId: string) {
  return db.dailyState.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  })
}

function fetchWeeklyCheckIns(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.weeklyCheckIn.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ year: "asc" }, { weekNumber: "asc" }],
  })
}

function fetchProjectCheckIns(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.projectCheckIn.findMany({
    where: { weeklyCheckIn: { planId: { in: planIds } } },
  })
}

function fetchWeeklyPlans(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.weeklyPlan.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ year: "asc" }, { weekNumber: "asc" }],
  })
}

function fetchMonthlyPlans(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.monthlyPlan.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  })
}

function fetchMonthlyReviews(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.monthlyReview.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  })
}

function fetchQuarterlyPlans(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.quarterlyPlan.findMany({
    where: { planId: { in: planIds } },
    orderBy: [{ year: "asc" }, { quarter: "asc" }],
  })
}

function fetchQuarterlyReviews(planIds: string[]) {
  if (planIds.length === 0) return Promise.resolve([])
  return db.quarterlyReview.findMany({
    where: { planId: { in: planIds } },
    orderBy: { quarter: "asc" },
  })
}

function fetchStreaks(userId: string) {
  return db.streak.findMany({ where: { userId } })
}

function fetchAchievements(userId: string) {
  return db.achievement.findMany({
    where: { userId },
    orderBy: { earnedAt: "asc" },
  })
}

function fetchReviewTemplates(userId: string) {
  return db.reviewTemplate.findMany({ where: { userId } })
}

/** Count user-created rows included in the export bundle. */
export function countExportRows(bundle: Omit<UserExportBundle, "meta">): number {
  const systemCompletionCount = bundle.systems.reduce(
    (sum, system) => sum + system.completions.length,
    0,
  )

  return (
    bundle.areas.length +
    (bundle.vision ? 1 + bundle.vision.items.length : 0) +
    bundle.yearlyPlans.length +
    bundle.antiGoals.length +
    bundle.wheel.length +
    bundle.projects.length +
    bundle.tasks.length +
    bundle.systems.length +
    systemCompletionCount +
    bundle.notes.length +
    bundle.resources.length +
    bundle.drifts.length +
    bundle.dailyStates.length +
    bundle.checkIns.weekly.length +
    bundle.checkIns.project.length +
    bundle.weeklyPlans.length +
    bundle.monthlyPlans.length +
    bundle.monthlyReviews.length +
    bundle.quarterlyPlans.length +
    bundle.quarterlyReviews.length +
    bundle.streaks.length +
    bundle.achievements.length +
    bundle.reviewTemplates.length
  )
}

export async function buildUserExport(userId: string): Promise<UserExportBundle> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true,
      planTier: true,
      preferences: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  const [areas, vision, yearlyPlans, notes, resources, drifts, dailyStates, streaks, achievements, reviewTemplates] =
    await Promise.all([
      fetchAreas(userId),
      fetchVision(userId),
      fetchYearlyPlans(userId),
      fetchNotes(userId),
      fetchResources(userId),
      fetchDrifts(userId),
      fetchDailyStates(userId),
      fetchStreaks(userId),
      fetchAchievements(userId),
      fetchReviewTemplates(userId),
    ])

  const planIds = yearlyPlans.map((plan) => plan.id)

  const [
    antiGoals,
    wheel,
    projects,
    weeklyCheckIns,
    weeklyPlans,
    monthlyPlans,
    monthlyReviews,
    quarterlyPlans,
    quarterlyReviews,
  ] = await Promise.all([
    fetchAntiGoals(planIds),
    fetchWheel(planIds),
    fetchProjects(planIds),
    fetchWeeklyCheckIns(planIds),
    fetchWeeklyPlans(planIds),
    fetchMonthlyPlans(planIds),
    fetchMonthlyReviews(planIds),
    fetchQuarterlyPlans(planIds),
    fetchQuarterlyReviews(planIds),
  ])

  const projectIds = projects.map((project) => project.id)

  const [tasks, systems, projectCheckIns] = await Promise.all([
    fetchTasks(projectIds),
    fetchSystems(projectIds),
    fetchProjectCheckIns(planIds),
  ])

  const bundleWithoutMeta = {
    user,
    areas,
    vision,
    yearlyPlans,
    antiGoals,
    wheel,
    projects,
    tasks,
    systems,
    notes,
    resources,
    drifts,
    dailyStates,
    checkIns: {
      weekly: weeklyCheckIns,
      project: projectCheckIns,
    },
    weeklyPlans,
    monthlyPlans,
    monthlyReviews,
    quarterlyPlans,
    quarterlyReviews,
    streaks,
    achievements,
    reviewTemplates,
  }

  const rowCount = countExportRows(bundleWithoutMeta)
  if (rowCount > MAX_EXPORT_ROWS) {
    throw new ExportTooLargeError(rowCount)
  }

  return {
    meta: {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      app: "yearinreview",
      rowCount,
    },
    ...bundleWithoutMeta,
  }
}
