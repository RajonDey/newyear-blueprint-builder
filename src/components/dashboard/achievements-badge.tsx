import { Trophy } from "lucide-react"
import { ACHIEVEMENTS } from "@/lib/constants/achievements"
import { Eyebrow } from "@/components/atmosphere/eyebrow"

interface AchievementRecord {
  id: string
  type: string
  title: string
  earnedAt: Date
}

interface AchievementsBadgeProps {
  achievements: AchievementRecord[]
}

/**
 * Pure presentational component — receives the achievements list from
 * `getDashboardData()` rather than fetching its own. This keeps all dashboard
 * data in a single round-trip and makes the component trivially testable.
 *
 * Returns `null` when there are no achievements (the page should skip
 * rendering the card entirely in that case).
 */
export function AchievementsBadge({ achievements }: AchievementsBadgeProps) {
  if (achievements.length === 0) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <Eyebrow className="mb-1.5 flex items-center gap-1.5">
            <Trophy className="h-3 w-3" />
            Quiet wins
          </Eyebrow>
          <h3 className="font-display text-xl md:text-2xl tracking-tight">
            What you&apos;ve held
          </h3>
        </div>
      </header>

      <ul className="flex flex-wrap gap-2">
        {achievements.map((a) => {
          const meta = ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS]
          return (
            <li key={a.id}>
              <span
                title={meta?.description ?? a.title}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm"
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
