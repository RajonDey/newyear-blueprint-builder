import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth-guard"
import { db } from "@/lib/db"
import { resolvePostAuthRedirect } from "@/lib/post-auth-redirect"

export default async function AuthContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await requireAuth()
  const sp = await searchParams

  const planCount = await db.yearlyPlan.count({
    where: { userId: session.user.id },
  })

  redirect(
    resolvePostAuthRedirect({
      yearlyPlanCount: planCount,
      callbackUrl: sp.callbackUrl,
    }),
  )
}
