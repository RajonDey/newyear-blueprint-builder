import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const patchSchema = z.object({
  northStar: z.string().trim().max(2000).nullable(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const vision = await db.vision.findUnique({
    where: { userId: session.user.id },
    include: { items: { orderBy: { order: "asc" } } },
  })
  return NextResponse.json({ data: vision })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const updated = await db.vision.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, northStar: parsed.data.northStar },
    update: { northStar: parsed.data.northStar },
  })

  return NextResponse.json({ data: updated })
}
