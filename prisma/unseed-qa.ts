import { config } from "dotenv"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"
import { QA_PREFIX, parseEmail, qa } from "./qa-seed-lib"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), ".env.local"), override: true })

const prisma = new PrismaClient()

async function main() {
  const email = parseEmail()
  const year = new Date().getFullYear()

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  })
  if (!user) {
    throw new Error(`[unseed-qa] No user for "${email}".`)
  }

  console.log(`[unseed-qa] Target: ${user.email}`)

  const plan = await prisma.yearlyPlan.findUnique({
    where: { userId_year: { userId: user.id, year } },
    select: { id: true, reflections: true },
  })

  if (plan) {
    const reflections = plan.reflections as { qaSeed?: boolean } | null
    if (reflections?.qaSeed) {
      await prisma.yearlyPlan.delete({ where: { id: plan.id } })
      console.log(`[unseed-qa] Deleted QA yearly plan ${year} (cascade)`)
    } else {
      console.warn(
        `[unseed-qa] Active plan for ${year} is not QA-marked — kept plan, removed only [QA]-prefixed rows.`,
      )
      await prisma.project.deleteMany({
        where: { planId: plan.id, title: { startsWith: qa("") } },
      })
      await prisma.antiGoal.deleteMany({
        where: { planId: plan.id, description: { startsWith: qa("") } },
      })
    }
  }

  const drifts = await prisma.drift.deleteMany({
    where: { userId: user.id, content: { startsWith: qa("") } },
  })
  const notes = await prisma.note.deleteMany({
    where: { userId: user.id, content: { startsWith: qa("") } },
  })
  const resources = await prisma.resource.deleteMany({
    where: { userId: user.id, title: { startsWith: qa("") } },
  })
  const daily = await prisma.dailyState.deleteMany({
    where: { userId: user.id, intention: { startsWith: qa("") } },
  })

  const vision = await prisma.vision.findUnique({ where: { userId: user.id } })
  if (vision) {
    await prisma.visionItem.deleteMany({
      where: { visionId: vision.id, title: { startsWith: qa("") } },
    })
    if (vision.northStar?.startsWith(QA_PREFIX)) {
      await prisma.vision.update({
        where: { id: vision.id },
        data: { northStar: null },
      })
    }
  }

  await prisma.streak.deleteMany({ where: { userId: user.id } })
  await prisma.achievement.deleteMany({ where: { userId: user.id } })
  await prisma.reviewTemplate.deleteMany({ where: { userId: user.id } })

  console.log(
    `[unseed-qa] Removed: drifts=${drifts.count} notes=${notes.count} resources=${resources.count} daily=${daily.count}`,
  )
  console.log("[unseed-qa] Done. Sign out/in if role changed elsewhere.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
