import type { PlanTier, Role } from "@prisma/client"
import { hasProProductAccess } from "@/lib/plan-access"
import { ProUpsellCard } from "@/components/upgrade/pro-upsell-card"

interface ProGateProps {
  /**
   * Caller's current planTier and role. We accept these explicitly rather than
   * reading the session ourselves so the gate stays a pure presentational
   * component usable from any RSC or client tree.
   */
  planTier: PlanTier
  role: Role
  /** Display name of the gated surface — used in the default fallback eyebrow + title. */
  feature: string
  /** Body copy for the default `<ProUpsellCard>` fallback. */
  description?: string
  /** Value-prop bullets shown in the default fallback. */
  bullets?: string[]
  /** Custom fallback — overrides the default `<ProUpsellCard>` entirely. */
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Server-friendly gating wrapper for Pro-only surfaces.
 *
 * Renders `children` if the user has Pro access (or is an ADMIN). Otherwise
 * renders the provided `fallback`, or a default `<ProUpsellCard>` themed for
 * the named feature.
 *
 * Pair with `lib/plan-access.ts` and `lib/feature-flags.ts` — never hand-roll
 * a Pro check in a page; always go through this gate so the visual fallback
 * stays consistent.
 *
 * @example
 * ```tsx
 * <ProGate planTier={user.planTier} role={user.role} feature="Analytics">
 *   <AnalyticsDashboard data={data} />
 * </ProGate>
 * ```
 */
export function ProGate({
  planTier,
  role,
  feature,
  description,
  bullets,
  fallback,
  children,
}: ProGateProps) {
  if (hasProProductAccess(planTier, role)) {
    return <>{children}</>
  }

  if (fallback !== undefined) {
    return <>{fallback}</>
  }

  return (
    <ProUpsellCard
      feature={feature}
      title={`${feature} unlocks at Pro.`}
      description={
        description ??
        "Pro adds depth where Free keeps things simple. Upgrade to unlock this surface — and keep your full year, always."
      }
      bullets={bullets}
    />
  )
}
