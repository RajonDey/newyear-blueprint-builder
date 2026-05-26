import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import {
  getEmailPreferences,
  mergeUserPreferences,
  parseUserPreferences,
} from "@/lib/user-preferences"

const emailPreferencesSchema = z.object({
  weeklyReviewReminder: z.boolean().optional(),
  monthlyNudge: z.boolean().optional(),
  quarterlyNudge: z.boolean().optional(),
  dailyNudge: z.boolean().optional(),
})

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  timezone: z.string().max(100).optional(),
  dismissWeekOneChecklist: z.boolean().optional(),
  recordVisionVisit: z.boolean().optional(),
  emailPreferences: emailPreferencesSchema.optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      timezone: true,
      preferences: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { preferences, ...profile } = user
  const emailPreferences = getEmailPreferences(parseUserPreferences(preferences))

  return NextResponse.json({ data: { ...profile, emailPreferences } })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const {
    dismissWeekOneChecklist,
    recordVisionVisit,
    emailPreferences,
    ...profile
  } = parsed.data

  const needsPreferences =
    dismissWeekOneChecklist ||
    recordVisionVisit ||
    emailPreferences !== undefined

  let preferencesUpdate: ReturnType<typeof parseUserPreferences> | undefined
  if (needsPreferences) {
    const existing = await db.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    })
    const current = parseUserPreferences(existing?.preferences)
    const now = new Date().toISOString()
    preferencesUpdate = mergeUserPreferences(current, {
      ...(dismissWeekOneChecklist || recordVisionVisit
        ? {
            weekOneChecklist: {
              ...(dismissWeekOneChecklist ? { dismissedAt: now } : {}),
              ...(recordVisionVisit ? { visitedVisionAt: now } : {}),
            },
          }
        : {}),
      ...(emailPreferences !== undefined
        ? { emailPreferences }
        : {}),
    })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...profile,
      ...(preferencesUpdate
        ? { preferences: preferencesUpdate as object }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      timezone: true,
      preferences: true,
    },
  })

  const emailPreferencesResolved = getEmailPreferences(
    parseUserPreferences(user.preferences),
  )
  const { preferences: _prefs, ...updatedProfile } = user

  return NextResponse.json({
    data: { ...updatedProfile, emailPreferences: emailPreferencesResolved },
  })
}
