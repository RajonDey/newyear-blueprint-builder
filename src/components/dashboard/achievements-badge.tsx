import { db } from "@/lib/db"
import { ACHIEVEMENTS } from "@/lib/constants/achievements"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"

export async function AchievementsBadge({ userId }: { userId: string }) {
  const earned = await db.achievement.findMany({
    where: { userId },
    orderBy: { earnedAt: "desc" },
    take: 5,
  })

  if (earned.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {earned.map((a) => {
            const meta = ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS]
            return (
              <div
                key={a.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                title={meta?.description ?? a.title}
              >
                <span className="text-lg">{meta?.icon ?? "🏅"}</span>
                <span className="font-medium">{meta?.title ?? a.title}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
