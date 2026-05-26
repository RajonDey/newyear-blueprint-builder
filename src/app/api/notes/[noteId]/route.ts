import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  content: z.string().trim().min(1).max(10_000).optional(),
  pinned: z.boolean().optional(),
})

async function noteForUser(noteId: string, userId: string) {
  return db.note.findFirst({ where: { id: noteId, userId } })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ noteId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { noteId } = await params
  const existing = await noteForUser(noteId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const note = await db.note.update({
    where: { id: noteId },
    data: parsed.data,
  })
  return NextResponse.json({ data: note })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ noteId: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { noteId } = await params
  const existing = await noteForUser(noteId, session.user.id)
  if (!existing) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }
  await db.note.delete({ where: { id: noteId } })
  return NextResponse.json({ ok: true })
}
