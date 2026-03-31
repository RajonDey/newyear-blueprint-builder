import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { noteId } = await params
  const note = await db.goalNote.findFirst({
    where: { id: noteId, goal: { plan: { userId: session.user.id } } },
  })
  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 })
  }

  await db.goalNote.delete({ where: { id: noteId } })

  return NextResponse.json({ data: { deleted: true } })
}
