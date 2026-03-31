import type { PlanTier, Role } from "@prisma/client"

/**
 * Pro-only product surfaces (analytics, quarterly review). Admins can access
 * for QA without a paid subscription.
 */
export function hasProProductAccess(planTier: PlanTier, role: Role): boolean {
  if (role === "ADMIN") return true
  return planTier === "PRO"
}
