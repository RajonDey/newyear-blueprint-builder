import type { Session } from "next-auth"
import type { PlanTier, Role } from "@prisma/client"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"

type DbSessionUser = {
  id: string
  email: string | null
  role: Role
  planTier: PlanTier
}

export type VerifiedSession = Session & {
  user: Session["user"] & {
    id: string
    role: Role
    planTier: PlanTier
  }
}

/**
 * Resolve the signed-in user against the database.
 * Falls back to email lookup when the JWT id is from another database (local ↔ Neon).
 */
export async function resolveSessionUser(
  session: Session | null,
): Promise<VerifiedSession | null> {
  const tokenId = session?.user?.id
  if (!tokenId) return null

  let dbUser = await db.user.findUnique({
    where: { id: tokenId },
    select: {
      id: true,
      email: true,
      role: true,
      planTier: true,
      disabledAt: true,
    },
  })

  if (
    !dbUser &&
    session?.user?.email &&
    session.user.email.length > 0
  ) {
    dbUser = await db.user.findFirst({
      where: { email: { equals: session.user.email, mode: "insensitive" } },
      select: {
        id: true,
        email: true,
        role: true,
        planTier: true,
        disabledAt: true,
      },
    })
  }

  if (!dbUser || dbUser.disabledAt) return null

  return {
    ...session,
    user: {
      ...session!.user,
      id: dbUser.id,
      email: dbUser.email ?? session!.user.email,
      role: dbUser.role,
      planTier: dbUser.planTier,
    },
  } as VerifiedSession
}

/** Page guard — redirects to login when JWT is missing or user row not in DB. */
export async function requireAuth(): Promise<VerifiedSession> {
  const session = await auth()
  const verified = await resolveSessionUser(session)
  if (!verified) {
    redirect("/login?error=SessionInvalid")
  }
  return verified
}

export async function requireAdmin(): Promise<VerifiedSession> {
  const session = await requireAuth()
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }
  return session
}

/** API guard — returns null when session cannot be tied to a live user row. */
export async function requireSessionUser(): Promise<VerifiedSession | null> {
  const session = await auth()
  return resolveSessionUser(session)
}

export type { DbSessionUser }
