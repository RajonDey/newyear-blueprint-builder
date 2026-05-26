/* Hallmark · design-system: design.md · designed-as-app */

import { Trophy } from "lucide-react"
import { ACHIEVEMENTS } from "@/lib/constants/achievements"

interface AchievementRecord {
  id: string
  type: string
  title: string
  earnedAt: Date
}

interface AchievementsBadgeProps {
  achievements: AchievementRecord[]
}

export function AchievementsBadge({ achievements }: AchievementsBadgeProps) {
  if (achievements.length === 0) return null

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl md:text-2xl tracking-tight inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" aria-hidden />
            Quiet wins
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            What you&apos;ve held
          </p>
        </div>
      </header>

      <ul className="flex flex-wrap gap-2">
        {achievements.map((a) => {
          const meta = ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS]
          return (
            <li key={a.id}>
              <span
                title={meta?.description ?? a.title}
                className="inline-flex items-center gap-2 border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <span aria-hidden className="text-base leading-none">
                  {meta?.icon ?? "🏅"}
                </span>
                <span className="font-medium">{meta?.title ?? a.title}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
