import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * Permanently delete the signed-in user and all related data (Prisma cascades).
 * Client should call signOut() after success.
 */
export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = session.user.id
  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await db.user.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: "Could not delete account" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
