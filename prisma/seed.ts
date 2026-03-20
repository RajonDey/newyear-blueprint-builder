import { config } from "dotenv"
import { resolve } from "path"
import { PrismaClient } from "@prisma/client"

config({ path: resolve(process.cwd(), ".env") })
config({ path: resolve(process.cwd(), ".env.local"), override: true })

const prisma = new PrismaClient()

function parseAdminEmails(): string[] {
  const raw = process.env.SEED_ADMIN_EMAILS?.trim()
  if (!raw) return []
  return [...new Set(raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean))]
}

async function main() {
  const emails = parseAdminEmails()

  if (emails.length === 0) {
    console.log(
      "[seed] SEED_ADMIN_EMAILS not set — no admin promotion. Set comma-separated emails in .env.local, then run again after those users have signed up once."
    )
    return
  }

  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (!user) {
      console.warn(
        `[seed] No user found for "${email}". Sign in once with Google or magic link, then run: npm run db:seed`
      )
      continue
    }

    if (user.role === "ADMIN") {
      console.log(`[seed] ${user.email} is already ADMIN`)
      continue
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    })
    console.log(`[seed] Promoted ${user.email} → ADMIN`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
