/** Canonical URL for today's systems checklist (Dashboard TodayCard). */
export const DAILY_HOME_HREF = "/dashboard#today"

/** Next.js `Link` object form — avoids hash parsing edge cases in client bundles. */
export const DAILY_HOME_LINK = {
  pathname: "/dashboard",
  hash: "today",
} as const
