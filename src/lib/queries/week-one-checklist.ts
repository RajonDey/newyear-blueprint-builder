import { db } from "@/lib/db"
import { getIsoWeekContextInTimeZone } from "@/lib/utils"
import {
  hasVisitedVision,
  isWeekOneChecklistDismissed,
  parseUserPreferences,
} from "@/lib/user-preferences"

export type WeekOneChecklistStepId =
  | "moreProjects"
  | "weeklyPlan"
  | "captureThought"
  | "weeklyReview"
  | "visitVision"

export type WeekOneChecklistStep = {
  id: WeekOneChecklistStepId
  label: string
  hint: string
  href?: string
  /** Opens the global quick-capture dialog instead of navigating. */
  action?: "quickCapture"
  done: boolean
  progress?: string
}

export type WeekOneChecklistData = {
  show: boolean
  steps: WeekOneChecklistStep[]
  completedCount: number
  totalCount: number
}

const TARGET_PROJECT_COUNT = 3

export async function getWeekOneChecklist(
  userId: string,
): Promise<WeekOneChecklistData> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { preferences: true, timezone: true },
  })
  if (!user) {
    return emptyChecklist(false)
  }

  const prefs = parseUserPreferences(user.preferences)
  if (isWeekOneChecklistDismissed(prefs)) {
    return emptyChecklist(false)
  }

  const plan = await db.yearlyPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { id: true },
  })
  if (!plan) {
    return emptyChecklist(false)
  }

  const { weekNumber, year } = getIsoWeekContextInTimeZone(
    new Date(),
    user.timezone || "UTC",
  )

  const [projectCount, weeklyPlan, driftCount, reviewCount, vision] =
    await Promise.all([
      db.project.count({ where: { planId: plan.id } }),
      db.weeklyPlan.findUnique({
        where: {
          planId_weekNumber_year: {
            planId: plan.id,
            weekNumber,
            year,
          },
        },
        select: { id: true },
      }),
      db.drift.count({ where: { userId } }),
      db.weeklyCheckIn.count({ where: { planId: plan.id } }),
      db.vision.findUnique({
        where: { userId },
        select: { northStar: true, _count: { select: { items: true } } },
      }),
    ])

  const moreProjectsDone = projectCount >= TARGET_PROJECT_COUNT
  const weeklyPlanDone = weeklyPlan != null
  const captureDone = driftCount >= 1
  const reviewDone = reviewCount >= 1
  const visionDone =
    hasVisitedVision(prefs) ||
    Boolean(vision?.northStar?.trim()) ||
    (vision?._count.items ?? 0) > 0

  const steps: WeekOneChecklistStep[] = [
    {
      id: "moreProjects",
      label: "Add 2 more projects",
      hint: "One keystone from onboarding — add a couple more when you're ready.",
      href: "/projects",
      done: moreProjectsDone,
      progress: moreProjectsDone
        ? undefined
        : `${Math.min(projectCount, TARGET_PROJECT_COUNT)}/${TARGET_PROJECT_COUNT} projects`,
    },
    {
      id: "weeklyPlan",
      label: "Set this week's plan",
      hint: "Pick up to three priority projects for the week.",
      href: "/rhythm/weekly?tab=plan",
      done: weeklyPlanDone,
    },
    {
      id: "captureThought",
      label: "Capture a thought",
      hint: "Press ⌘K (Ctrl+K) anywhere — save it to your drift inbox.",
      action: "quickCapture",
      done: captureDone,
    },
    {
      id: "weeklyReview",
      label: "Complete your first weekly review",
      hint: "Close the loop on Friday — rate progress and note what's next.",
      href: "/rhythm/weekly?tab=review",
      done: reviewDone,
    },
    {
      id: "visitVision",
      label: "Visit your Vision",
      hint: "Your north star lives outside any single year.",
      href: "/vision",
      done: visionDone,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length

  return {
    show: true,
    steps,
    completedCount,
    totalCount: steps.length,
  }
}

function emptyChecklist(show: boolean): WeekOneChecklistData {
  return {
    show,
    steps: [],
    completedCount: 0,
    totalCount: 5,
  }
}
