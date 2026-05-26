import type { PlanTier, Role } from "@prisma/client"
import { hasProProductAccess } from "@/lib/plan-access"

/**
 * Feature-level gating helpers.
 *
 * Each function answers a single yes/no question scoped to one feature, so
 * callsites read clearly (`if (canSeeFullWrapped(tier, role)) …`) and so we
 * can later diverge per-feature pricing without touching every callsite.
 *
 * Internally they currently all delegate to `hasProProductAccess`, but the
 * indirection lets us, for example, give the Wrapped a different tier
 * threshold later without a refactor.
 *
 * Use these from server components / route handlers. Mirror them on the
 * client only via prop-drilling — never call `useSession` ad-hoc on the
 * client to re-derive Pro state.
 */

/**
 * Can the user see the full, cinematic, animated annual Wrapped?
 * Free users still see a static summary card; this flag controls the deck.
 */
export function canSeeFullWrapped(planTier: PlanTier, role: Role): boolean {
  return hasProProductAccess(planTier, role)
}

/**
 * Can the user see the advanced analytics dashboard?
 * (Habit trends, mood trends, wheel evolution, multi-quarter compares.)
 */
export function canSeeAdvancedAnalytics(
  planTier: PlanTier,
  role: Role,
): boolean {
  return hasProProductAccess(planTier, role)
}

/**
 * Can the user run a quarterly review?
 * Quarterly recap cards are still viewable on Free; this gates the *form*.
 */
export function canRunQuarterlyReview(
  planTier: PlanTier,
  role: Role,
): boolean {
  return hasProProductAccess(planTier, role)
}

/**
 * Can the user see Monthly + Quarterly recap cards in `/recap/[period]`?
 * Monthly is currently Free; Quarterly is Pro.
 */
export function canSeeQuarterlyRecap(planTier: PlanTier, role: Role): boolean {
  return hasProProductAccess(planTier, role)
}
