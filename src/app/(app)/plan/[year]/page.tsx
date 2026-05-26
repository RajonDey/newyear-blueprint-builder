import { redirect } from "next/navigation"

/**
 * Legacy "yearly plan" page. The PARA refactor moves the year view into the
 * everyday `/dashboard` + `/goals` + `/recap/year` triad, so we keep a
 * permanent redirect for any inbound traffic that still hits this URL.
 *
 * `params` is awaited only because Next 16 requires it; we don't actually use
 * the year — the dashboard already greets the user with whatever's current.
 */
export default async function PlanYearRedirect({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  await params
  redirect("/dashboard")
}
