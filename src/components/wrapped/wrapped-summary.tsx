"use client"

/* Hallmark · design-system: design.md · designed-as-app
 * Year Wrapped — ceremony header, editorial stat strip (Wave G).
 */

import type { WrappedData } from "@/lib/queries/wrapped"
import { BrandMark } from "@/components/shared/brand-mark"
import {
  CeremonySequence,
  CeremonyStep,
} from "@/components/shared/ceremony-entrance"
import { WheelChart } from "@/components/dashboard/wheel-chart"
import { EmptyState } from "@/components/shared/empty-state"
import { Sparkles, Trophy } from "lucide-react"

export function WrappedSummary({
  initialData,
  showOffSeasonBanner = false,
}: {
  initialData: WrappedData
  showOffSeasonBanner?: boolean
}) {
  if (!initialData) {
    return (
      <div className="space-y-6">
        {showOffSeasonBanner && <WrappedOffSeasonBanner />}
        <EmptyState
          icon={Sparkles}
          title="No year to wrap yet"
          description="Create your yearly plan and live through the year. Your Year Wrapped will appear here with your progress, achievements, and reflections."
          action={
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 text-amber hover:underline font-medium"
            >
              Create your plan →
            </a>
          }
        />
      </div>
    )
  }

  const { plan, stats, completedGoals, wheelScores, achievements } = initialData

  const statItems = [
    {
      key: "projects",
      value: `${stats.completedGoals}/${stats.totalGoals}`,
      qualifier: "Projects completed",
    },
    {
      key: "checkins",
      value: String(stats.totalCheckIns),
      qualifier: "Weekly check-ins",
    },
    {
      key: "streak",
      value: `${stats.longestStreak}w`,
      qualifier: "Longest streak",
    },
    {
      key: "mood",
      value: stats.avgMood != null ? stats.avgMood.toFixed(1) : "—",
      qualifier: "Avg mood",
    },
  ]

  return (
    <CeremonySequence className="mx-auto max-w-2xl space-y-12 py-8">
      {showOffSeasonBanner && (
        <CeremonyStep delay={0}>
          <WrappedOffSeasonBanner />
        </CeremonyStep>
      )}

      <CeremonyStep delay={showOffSeasonBanner ? 40 : 0}>
        <header className="flex flex-col items-center gap-6 text-center">
          <BrandMark size="xl" label="YearInReview" />
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Your {plan.year} in review
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {plan.theme
                ? `The year you called “${plan.theme}” — looked back with care.`
                : "A mindful look back at your journey."}
            </p>
          </div>
        </header>
      </CeremonyStep>

      <CeremonyStep delay={showOffSeasonBanner ? 100 : 60}>
        <section
          aria-label="Year at a glance"
          className="border border-border"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4">
            {statItems.map((stat) => (
              <div key={stat.key} className="min-w-0 p-4 sm:p-5 text-center sm:text-left">
                <p className="font-display text-2xl sm:text-3xl tabular-nums leading-none tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-xs font-medium text-foreground">
                  {stat.qualifier}
                </p>
              </div>
            ))}
          </div>
        </section>
      </CeremonyStep>

      {wheelScores.length > 0 && (
        <CeremonyStep delay={showOffSeasonBanner ? 160 : 120}>
          <div className="border border-border p-4 sm:p-6">
            <WheelChart scores={wheelScores} />
          </div>
        </CeremonyStep>
      )}

      {completedGoals.length > 0 && (
        <CeremonyStep delay={showOffSeasonBanner ? 220 : 180}>
          <section className="border border-border">
            <header className="border-b border-border px-4 py-3">
              <h2 className="font-display text-lg tracking-tight">
                Projects you finished
              </h2>
            </header>
            <ul className="divide-y divide-border">
              {completedGoals.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center gap-3 px-4 py-3 text-sm"
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-positive"
                    aria-hidden
                  />
                  <span>{g.title}</span>
                </li>
              ))}
            </ul>
          </section>
        </CeremonyStep>
      )}

      {achievements.length > 0 && (
        <CeremonyStep delay={showOffSeasonBanner ? 280 : 240}>
          <section className="border border-border">
            <header className="border-b border-border px-4 py-3">
              <h2 className="font-display text-lg tracking-tight inline-flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber" aria-hidden />
                Achievements
              </h2>
            </header>
            <ul className="divide-y divide-border">
              {achievements.map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <p className="text-sm font-medium">
                    {a.meta?.title ?? a.title}
                  </p>
                  {a.meta?.description ? (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {a.meta.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        </CeremonyStep>
      )}

      <CeremonyStep delay={showOffSeasonBanner ? 340 : 300}>
        <footer className="border-y border-border py-8 text-center">
          <blockquote className="font-display text-xl italic text-muted-foreground max-w-md mx-auto leading-snug">
            {plan.theme
              ? `“${plan.theme}” — carried quietly, week by week.`
              : "Small reps. Steady hands. The year adds up."}
          </blockquote>
        </footer>
      </CeremonyStep>
    </CeremonySequence>
  )
}

function WrappedOffSeasonBanner() {
  return (
    <div className="border border-amber/40 bg-amber-tint px-4 py-3.5 text-sm text-muted-foreground leading-relaxed">
      <p className="font-medium text-foreground">
        Your year-end story unlocks in December
      </p>
      <p className="mt-1 text-xs">
        Year Wrapped shines brightest at the close of the year. You can still
        browse your progress here anytime — the cinematic recap lands when the
        year turns.
      </p>
    </div>
  )
}
