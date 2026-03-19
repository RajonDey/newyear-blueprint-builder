import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getWrappedData } from "@/lib/queries/wrapped"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const year = searchParams.get("year")
  const yearNum = year ? parseInt(year, 10) : undefined

  const data = await getWrappedData(session.user.id, yearNum)
  return NextResponse.json({ data })
}
