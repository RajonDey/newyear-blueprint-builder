import { planLimits } from "@/lib/config"

/**
 * Marketing-facing plan limits — always derived from `planLimits` so pricing
 * pages stay aligned with API enforcement.
 */
export const marketingPlanCopy = {
  freeProjects: planLimits.FREE.maxProjects,
  proProjects: planLimits.PRO.maxProjects,
  freeAntiGoals: planLimits.FREE.maxAntiGoalsPerPlan,
  proAntiGoals: planLimits.PRO.maxAntiGoalsPerPlan,
  freeSystemsPerProject: planLimits.FREE.maxSystemsPerProject,
  proSystemsPerProject: planLimits.PRO.maxSystemsPerProject,
  proAnnualPrice: "$59",
  /** Monthly billing copy — v1 ships yearly only (PC-02). */
  proMonthlyLabel: "Coming soon",
  jsonExportLabel: "Included in Settings",
  onboardingLabel: "90-second onboarding + year-round editing",
} as const
