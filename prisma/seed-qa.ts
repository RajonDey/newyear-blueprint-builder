import { config } from "dotenv"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"
import {
  DEFAULT_MONTHLY_REVIEW_FIELDS,
  DEFAULT_QUARTERLY_REVIEW_FIELDS,
  QA_PREFIX,
  QA_SEED_REFLECTIONS,
  areaIdForCategory,
  currentMonthContext,
  ensureDefaultAreas,
  getQuarterForDate,
  parseEmail,
  pastDailyDates,
  pastWeekContexts,
  previousMonthContext,
  previousQuarter,
  qa,
  shouldReset,
} from "./qa-seed-lib"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), ".env.local"), override: true })

const prisma = new PrismaClient()

async function removeQaPlan(userId: string, year: number) {
  const plan = await prisma.yearlyPlan.findUnique({
    where: { userId_year: { userId, year } },
    select: { id: true, reflections: true },
  })
  if (!plan) return false

  const reflections = plan.reflections as { qaSeed?: boolean } | null
  if (!reflections?.qaSeed) {
    console.warn(
      `[seed-qa] Plan for ${year} exists but was not QA-seeded — skipping delete. Set SEED_QA_RESET=true only after backing up, or use db:unseed-qa.`,
    )
    return false
  }

  await prisma.yearlyPlan.delete({ where: { id: plan.id } })
  console.log(`[seed-qa] Removed QA yearly plan ${year} (cascade)`)
  return true
}

async function removeQaUserScoped(userId: string) {
  const drifts = await prisma.drift.deleteMany({
    where: { userId, content: { startsWith: qa("") } },
  })
  const notes = await prisma.note.deleteMany({
    where: { userId, content: { startsWith: qa("") } },
  })
  const resources = await prisma.resource.deleteMany({
    where: { userId, title: { startsWith: qa("") } },
  })
  const daily = await prisma.dailyState.deleteMany({
    where: { userId, intention: { startsWith: qa("") } },
  })

  const vision = await prisma.vision.findUnique({ where: { userId } })
  if (vision) {
    await prisma.visionItem.deleteMany({
      where: { visionId: vision.id, title: { startsWith: qa("") } },
    })
    if (vision.northStar?.startsWith(qa(""))) {
      await prisma.vision.update({
        where: { id: vision.id },
        data: { northStar: null },
      })
    }
  }

  await prisma.streak.deleteMany({ where: { userId } })
  await prisma.achievement.deleteMany({ where: { userId } })
  await prisma.reviewTemplate.deleteMany({ where: { userId } })

  console.log(
    `[seed-qa] Cleared user-scoped QA rows: drifts=${drifts.count} notes=${notes.count} resources=${resources.count} daily=${daily.count}`,
  )
}

async function main() {
  const email = parseEmail()
  const year = new Date().getFullYear()
  const now = new Date()
  const currentQuarter = getQuarterForDate(now)
  const prevQuarter = previousQuarter()

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  })
  if (!user) {
    throw new Error(
      `[seed-qa] No user for "${email}". Sign in once on the app, then re-run.`,
    )
  }

  console.log(`[seed-qa] Target: ${user.email} (${user.id})`)

  if (shouldReset()) {
    await removeQaUserScoped(user.id)
    await removeQaPlan(user.id, year)
  }

  await ensureDefaultAreas(user.id, prisma)

  let plan = await prisma.yearlyPlan.findFirst({
    where: { userId: user.id, year, status: "ACTIVE" },
    include: {
      projects: { select: { id: true, type: true, title: true } },
    },
  })

  if (!plan) {
    await prisma.yearlyPlan.updateMany({
      where: { userId: user.id, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    })

    plan = await prisma.yearlyPlan.create({
      data: {
        userId: user.id,
        year,
        status: "ACTIVE",
        reflections: QA_SEED_REFLECTIONS,
        wheelEntries: {
          create: [
            { category: "HEALTH", rating: 7 },
            { category: "CAREER", rating: 6 },
            { category: "FINANCE", rating: 5 },
            { category: "RELATIONSHIPS", rating: 8 },
            { category: "SPIRITUALITY", rating: 4 },
            { category: "PASSION", rating: 6 },
          ],
        },
      },
      include: {
        projects: { select: { id: true, type: true, title: true } },
      },
    })
    console.log(`[seed-qa] Created active plan ${plan.id}`)
  } else {
    await prisma.yearlyPlan.update({
      where: { id: plan.id },
      data: {
        reflections: {
          ...(typeof plan.reflections === "object" && plan.reflections !== null
            ? (plan.reflections as object)
            : {}),
          ...QA_SEED_REFLECTIONS,
        },
      },
    })

    const wheelCount = await prisma.wheelOfLifeEntry.count({
      where: { planId: plan.id },
    })
    if (wheelCount === 0) {
      await prisma.wheelOfLifeEntry.createMany({
        data: [
          { planId: plan.id, category: "HEALTH", rating: 7 },
          { planId: plan.id, category: "CAREER", rating: 6 },
          { planId: plan.id, category: "FINANCE", rating: 5 },
          { planId: plan.id, category: "RELATIONSHIPS", rating: 8 },
          { planId: plan.id, category: "SPIRITUALITY", rating: 4 },
          { planId: plan.id, category: "PASSION", rating: 6 },
        ],
      })
    }
    console.log(`[seed-qa] Using existing plan ${plan.id}`)
  }

  const planId = plan.id

  // ── Vision ──
  let vision = await prisma.vision.findUnique({ where: { userId: user.id } })
  if (!vision) {
    vision = await prisma.vision.create({
      data: { userId: user.id, northStar: qa("Become a calm, focused builder who ships meaningful work.") },
    })
  } else if (!vision.northStar?.startsWith(QA_PREFIX)) {
    await prisma.vision.update({
      where: { id: vision.id },
      data: { northStar: qa("Become a calm, focused builder who ships meaningful work.") },
    })
  }

  const existingVisionItems = await prisma.visionItem.count({
    where: { visionId: vision.id, title: { startsWith: qa("") } },
  })
  if (existingVisionItems === 0) {
    const healthAreaId = await areaIdForCategory(user.id, "HEALTH", prisma)
    const careerAreaId = await areaIdForCategory(user.id, "CAREER", prisma)
    await prisma.visionItem.createMany({
      data: [
        {
          visionId: vision.id,
          areaId: careerAreaId,
          kind: "MILESTONE",
          title: qa("Ship YearInReview v1"),
          body: "Launch with PARA planning and rhythm reviews.",
          order: 0,
        },
        {
          visionId: vision.id,
          areaId: healthAreaId,
          kind: "VALUE",
          title: qa("Energy first"),
          body: "Protect sleep and movement before overcommitting.",
          order: 1,
        },
        {
          visionId: vision.id,
          kind: "QUOTE",
          title: qa("Focus is a practice"),
          body: "What you do daily matters more than what you do once.",
          order: 2,
        },
      ],
    })
  }

  const milestone = await prisma.visionItem.findFirst({
    where: { visionId: vision.id, title: { startsWith: qa("Ship") } },
    select: { id: true },
  })

  // ── Anti-goals ──
  const antiGoalCount = await prisma.antiGoal.count({ where: { planId } })
  if (antiGoalCount === 0) {
    await prisma.antiGoal.createMany({
      data: [
        { planId, description: qa("Say yes to every meeting request"), category: "CAREER" },
        { planId, description: qa("Scroll social feeds before noon"), category: "HEALTH" },
        { planId, description: qa("Start new projects before finishing current ones"), category: "PASSION" },
      ],
    })
  }

  const antiGoals = await prisma.antiGoal.findMany({ where: { planId }, take: 1 })

  // ── Projects ──
  let primary = plan.projects.find((p) => p.type === "PRIMARY")
  if (!primary) {
    const careerAreaId = await areaIdForCategory(user.id, "CAREER", prisma)
    primary = await prisma.project.create({
      data: {
        planId,
        areaId: careerAreaId,
        visionItemId: milestone?.id ?? null,
        category: "CAREER",
        type: "PRIMARY",
        title: qa("Launch YearInReview to first 100 users"),
        description: qa("Primary outcome for the year — marketing, onboarding, and polish."),
        status: "IN_PROGRESS",
        sortOrder: 0,
      },
      select: { id: true, type: true, title: true },
    })
  }

  const qaSecondarySpecs = [
    {
      category: "HEALTH" as const,
      title: qa("Run a consistent morning mobility routine"),
      status: "ON_TRACK" as const,
    },
    {
      category: "FINANCE" as const,
      title: qa("Build a 3-month emergency fund"),
      status: "NOT_STARTED" as const,
    },
    {
      category: "PASSION" as const,
      title: qa("Publish 6 essays on the blog"),
      status: "AT_RISK" as const,
    },
  ]

  const secondaryProjects = []
  for (let i = 0; i < qaSecondarySpecs.length; i++) {
    const spec = qaSecondarySpecs[i]
    let project = await prisma.project.findFirst({
      where: { planId, title: spec.title },
      select: { id: true, title: true, category: true },
    })
    if (!project) {
      const areaId = await areaIdForCategory(user.id, spec.category, prisma)
      project = await prisma.project.create({
        data: {
          planId,
          areaId,
          category: spec.category,
          type: "SECONDARY",
          title: spec.title,
          status: spec.status,
          sortOrder: i + 1,
        },
        select: { id: true, title: true, category: true },
      })
    }
    secondaryProjects.push(project)
  }

  const allProjectIds = [primary.id, ...secondaryProjects.map((p) => p.id)]

  // ── Execution layer ──
  const taskCount = await prisma.task.count({
    where: { projectId: { in: allProjectIds }, description: { startsWith: qa("") } },
  })
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        { projectId: primary.id, type: "BIG", description: qa("Draft launch checklist"), status: "IN_PROGRESS" },
        { projectId: primary.id, type: "MEDIUM", description: qa("Record 2-min product demo"), status: "NOT_STARTED" },
        { projectId: secondaryProjects[0].id, type: "SMALL", description: qa("10-minute hip mobility"), status: "ON_TRACK" },
        { projectId: secondaryProjects[1].id, type: "MEDIUM", description: qa("Set up automatic savings transfer"), status: "NOT_STARTED" },
        { projectId: secondaryProjects[2].id, type: "SMALL", description: qa("Outline essay #1"), status: "AT_RISK" },
      ],
    })
  }

  const krCount = await prisma.keyResult.count({
    where: { projectId: primary.id, title: { startsWith: qa("") } },
  })
  if (krCount === 0) {
    await prisma.keyResult.createMany({
      data: [
        { projectId: primary.id, title: qa("Beta signups"), currentValue: 12, targetValue: 100, unit: "users", sortOrder: 0 },
        { projectId: primary.id, title: qa("Weekly active planners"), currentValue: 4, targetValue: 40, unit: "users", sortOrder: 1 },
      ],
    })
  }

  const cpCount = await prisma.projectCheckpoint.count({
    where: { projectId: primary.id, title: { startsWith: qa("") } },
  })
  if (cpCount === 0) {
    await prisma.projectCheckpoint.createMany({
      data: [
        { projectId: primary.id, quarter: "Q1", title: qa("Private beta ready"), status: "COMPLETED" },
        { projectId: primary.id, quarter: "Q2", title: qa("Public launch"), status: "IN_PROGRESS" },
        { projectId: primary.id, quarter: "Q3", title: qa("Pro tier live"), status: "NOT_STARTED" },
        { projectId: primary.id, quarter: "Q4", title: qa("Year Wrapped season"), status: "NOT_STARTED" },
      ],
    })
  }

  const motivation = await prisma.motivation.findUnique({ where: { projectId: primary.id } })
  if (!motivation) {
    await prisma.motivation.create({
      data: {
        projectId: primary.id,
        whyText: qa("I want a calm system that helps people plan and reflect without guilt."),
        consequenceText: qa("Without shipping, the idea stays stuck and I lose momentum."),
      },
    })
  }

  let dailySystem = await prisma.system.findFirst({
    where: { projectId: primary.id, description: { startsWith: qa("Review top 3 priorities") } },
  })
  if (!dailySystem) {
    dailySystem = await prisma.system.create({
      data: {
        projectId: primary.id,
        description: qa("Review top 3 priorities for 5 minutes"),
        frequency: "DAILY",
        isActive: true,
      },
    })
  }

  let weeklySystem = await prisma.system.findFirst({
    where: { projectId: secondaryProjects[0].id, frequency: "WEEKLY" },
  })
  if (!weeklySystem) {
    weeklySystem = await prisma.system.create({
      data: {
        projectId: secondaryProjects[0].id,
        description: qa("Long walk without phone"),
        frequency: "WEEKLY",
        isActive: true,
      },
    })
  }

  const completionDates = pastDailyDates(10)
  for (const date of completionDates) {
    await prisma.systemCompletion.upsert({
      where: { systemId_date: { systemId: dailySystem.id, date } },
      create: { systemId: dailySystem.id, date, completedAt: date },
      update: {},
    })
  }

  // ── Rhythm: weekly ──
  const weekContexts = pastWeekContexts(3)
  for (let i = 0; i < weekContexts.length; i++) {
    const { weekNumber, year: weekYear } = weekContexts[i]
    const isCurrent = i === 0

    await prisma.weeklyPlan.upsert({
      where: { planId_weekNumber_year: { planId, weekNumber, year: weekYear } },
      create: {
        planId,
        weekNumber,
        year: weekYear,
        priorityProjectIds: [primary.id, secondaryProjects[0].id],
        protectCategory: "HEALTH",
        commitments: { focus: qa(isCurrent ? "Launch prep + QA pass" : "Steady execution week") },
      },
      update: {},
    })

    const existingCheckIn = await prisma.weeklyCheckIn.findUnique({
      where: { planId_weekNumber_year: { planId, weekNumber, year: weekYear } },
    })

    if (!existingCheckIn) {
      const checkIn = await prisma.weeklyCheckIn.create({
        data: {
          planId,
          weekNumber,
          year: weekYear,
          overallMood: 4 - i,
          notes: qa(`Week ${weekNumber} — good progress on launch tasks.`),
          nextWeekFocus: qa("Keep scope tight; finish QA checklist."),
          completedAt: subDaysSafe(now, i * 7),
        },
      })

      for (const projectId of allProjectIds.slice(0, 3)) {
        await prisma.projectCheckIn.create({
          data: {
            weeklyCheckInId: checkIn.id,
            projectId,
            progressRating: Math.max(2, 4 - i),
            notes: qa("Moving forward"),
            blockers: i === 2 ? qa("Waiting on design feedback") : null,
          },
        })
      }
    }
  }

  // ── Rhythm: monthly ──
  const { month: curMonth, year: curMonthYear } = currentMonthContext()
  const { month: prevMonth, year: prevMonthYear } = previousMonthContext()

  for (const ctx of [
    { month: curMonth, year: curMonthYear, focus: qa("May focus: launch readiness") },
    { month: prevMonth, year: prevMonthYear, focus: qa("April focus: PARA foundation") },
  ]) {
    await prisma.monthlyPlan.upsert({
      where: { planId_month_year: { planId, month: ctx.month, year: ctx.year } },
      create: {
        planId,
        month: ctx.month,
        year: ctx.year,
        monthFocus: ctx.focus,
        projectIntentions: {
          [primary.id]: qa("Ship beta"),
          [secondaryProjects[0].id]: qa("Move daily"),
        },
        topIntentions: [qa("QA the full app"), qa("Protect mornings"), qa("Ship one marketing page")],
      },
      update: {},
    })

    const existingReview = await prisma.monthlyReview.findUnique({
      where: { planId_month_year: { planId, month: ctx.month, year: ctx.year } },
    })
    if (!existingReview) {
      await prisma.monthlyReview.create({
        data: {
          planId,
          month: ctx.month,
          year: ctx.year,
          summary: qa("Solid month — rhythm reviews stayed consistent."),
          winsText: qa("Finished onboarding flow and dashboard polish."),
          challengesText: qa("Scope creep on nice-to-have features."),
          adjustments: qa("Time-box polish; prioritize launch blockers."),
          nextMonthFocus: qa("Manual QA + bug bash"),
          responses: {
            summary: qa("Solid month — rhythm reviews stayed consistent."),
            winsText: qa("Finished onboarding flow and dashboard polish."),
            challengesText: qa("Scope creep on nice-to-have features."),
            adjustments: qa("Time-box polish; prioritize launch blockers."),
          },
          completedAt: subDaysSafe(now, ctx.month === prevMonth ? 20 : 3),
        },
      })
    }
  }

  // ── Rhythm: quarterly ──
  for (const q of [currentQuarter, prevQuarter]) {
    await prisma.quarterlyPlan.upsert({
      where: { planId_quarter: { planId, quarter: q } },
      create: {
        planId,
        quarter: q,
        year,
        quarterFocus: qa(`${q} focus: build and validate`),
        projectIntentions: { [primary.id]: qa("Reach public launch") },
        topIntentions: [qa("Complete MVP"), qa("Run beta cohort"), qa("Document decisions")],
      },
      update: {},
    })

    const existingQReview = await prisma.quarterlyReview.findUnique({
      where: { planId_quarter: { planId, quarter: q } },
    })
    if (!existingQReview) {
      await prisma.quarterlyReview.create({
        data: {
          planId,
          quarter: q,
          summary: qa(`${q} was about turning the vision into a shippable product.`),
          winsText: qa("PARA model landed; rhythm surfaces feel cohesive."),
          challengesText: qa("Balancing depth vs launch timeline."),
          adjustments: qa("Cut deferred features; ship core loop first."),
          responses: {
            summary: qa(`${q} was about turning the vision into a shippable product.`),
            winsText: qa("PARA model landed; rhythm surfaces feel cohesive."),
            challengesText: qa("Balancing depth vs launch timeline."),
            adjustments: qa("Cut deferred features; ship core loop first."),
          },
          wheelOfLifeSnapshot: {
            HEALTH: 7,
            CAREER: 6,
            FINANCE: 5,
            RELATIONSHIPS: 8,
            SPIRITUALITY: 4,
            PASSION: 6,
          },
          completedAt: subDaysSafe(now, q === prevQuarter ? 45 : 10),
        },
      })
    }
  }

  // ── Review templates ──
  await prisma.reviewTemplate.upsert({
    where: { userId_cadence: { userId: user.id, cadence: "MONTHLY" } },
    create: {
      userId: user.id,
      cadence: "MONTHLY",
      fields: DEFAULT_MONTHLY_REVIEW_FIELDS,
    },
    update: {},
  })
  await prisma.reviewTemplate.upsert({
    where: { userId_cadence: { userId: user.id, cadence: "QUARTERLY" } },
    create: {
      userId: user.id,
      cadence: "QUARTERLY",
      fields: DEFAULT_QUARTERLY_REVIEW_FIELDS,
    },
    update: {},
  })

  // ── Drifts ──
  const openDrifts = await prisma.drift.count({
    where: { userId: user.id, resolvedAt: null, content: { startsWith: qa("") } },
  })
  if (openDrifts === 0) {
    await prisma.drift.createMany({
      data: [
        { userId: user.id, content: qa("Idea: weekly recap email template"), kind: "NOTE" },
        { userId: user.id, content: qa("Follow up with beta tester about onboarding"), kind: "TASK" },
        { userId: user.id, content: qa("Read PARA book chapter on areas"), kind: "RESOURCE" },
        { userId: user.id, content: qa("Why does quarterly plan feel empty on first visit?"), kind: "QUESTION" },
      ],
    })
    await prisma.drift.create({
      data: {
        userId: user.id,
        content: qa("Archived thought — already turned into a task"),
        kind: "THOUGHT",
        resolvedAt: subDaysSafe(now, 2),
        resolvedAs: "task",
      },
    })
  }

  // ── Knowledge ──
  const healthAreaId = await areaIdForCategory(user.id, "HEALTH", prisma)
  const noteCount = await prisma.note.count({
    where: { userId: user.id, content: { startsWith: qa("") } },
  })
  if (noteCount === 0) {
    await prisma.note.createMany({
      data: [
        {
          userId: user.id,
          parentType: "AREA",
          parentId: healthAreaId,
          content: qa("<p>Morning routine: water, stretch, 10-min walk.</p>"),
          pinned: true,
        },
        {
          userId: user.id,
          parentType: "PROJECT",
          parentId: primary.id,
          content: qa("<p>Launch blockers: auth edge cases, empty states, mobile nav.</p>"),
        },
        {
          userId: user.id,
          parentType: "VISION",
          parentId: vision.id,
          content: qa("<p>North star reminder: ship calm tools, not noisy dashboards.</p>"),
        },
      ],
    })
  }

  const resourceCount = await prisma.resource.count({
    where: { userId: user.id, title: { startsWith: qa("") } },
  })
  if (resourceCount === 0) {
    await prisma.resource.createMany({
      data: [
        {
          userId: user.id,
          parentType: "PROJECT",
          parentId: primary.id,
          kind: "LINK",
          title: qa("Launch checklist (Notion)"),
          url: "https://example.com/qa-launch-checklist",
        },
        {
          userId: user.id,
          parentType: "AREA",
          parentId: healthAreaId,
          kind: "LINK",
          title: qa("Mobility routine video"),
          url: "https://example.com/qa-mobility",
        },
      ],
    })
  }

  // ── Daily state (analytics + today card) ──
  for (let i = 0; i < 14; i++) {
    const date = dateOnly(subDaysSafe(now, i))
    await prisma.dailyState.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: {
        userId: user.id,
        date,
        mood: (i % 5) + 1,
        energy: ((i + 2) % 5) + 1,
        intention: qa(`Day intention ${14 - i}: focus on one meaningful outcome.`),
        reflection: i > 0 && i < 5 ? qa("End-of-day: shipped a small win.") : null,
        antiGoalHeldId: antiGoals[0]?.id ?? null,
        antiGoalHeld: i % 3 === 0 ? true : i % 3 === 1 ? false : null,
      },
      update: {},
    })
  }

  // ── Gamification ──
  await prisma.streak.upsert({
    where: { userId_type: { userId: user.id, type: "WEEKLY_CHECK_IN" } },
    create: {
      userId: user.id,
      type: "WEEKLY_CHECK_IN",
      currentStreak: 3,
      longestStreak: 5,
      lastCompletedAt: now,
    },
    update: {
      currentStreak: 3,
      longestStreak: 5,
      lastCompletedAt: now,
    },
  })

  const achievementTypes = ["first_check_in", "streak_4", "quarter_complete", "plan_created"]
  for (const type of achievementTypes) {
    await prisma.achievement.upsert({
      where: { userId_type: { userId: user.id, type } },
      create: {
        userId: user.id,
        type,
        title: type,
        earnedAt: subDaysSafe(now, 7),
      },
      update: {},
    })
  }

  // Promote admin if not already
  if (user.role !== "ADMIN") {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    })
    console.log(`[seed-qa] Promoted ${user.email} → ADMIN`)
  }

  console.log("[seed-qa] Done. Reload the app and walk the sidebar.")
  console.log("[seed-qa] To remove QA data later: npm run db:unseed-qa")
}

function subDaysSafe(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function dateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
