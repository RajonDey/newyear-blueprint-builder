import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getWrappedData } from "@/lib/queries/wrapped"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year")
  const yearNum = year ? parseInt(year, 10) : undefined

  const data = await getWrappedData(session.user.id, yearNum)

  if (data) {
    await db.achievement.upsert({
      where: {
        userId_type: { userId: session.user.id, type: "year_wrapped" },
      },
      create: {
        userId: session.user.id,
        type: "year_wrapped",
        title: "Year in Review",
      },
      update: {},
    })
  }

  return NextResponse.json({ data })
}
