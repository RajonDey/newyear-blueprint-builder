export const siteConfig = {
  name: "YearInReview",
  description:
    "A mindful annual planning platform — reflect on your journey, set intentional goals, and walk your path with clarity all year long.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://yearinreview.online",
  ogImage: "/images/og/default.png",
  creator: "YearInReview",
  keywords: [
    "year planning",
    "annual goals",
    "project planning",
    "goal tracking",
    "life planning",
    "wheel of life",
    "PARA method",
    "habit tracking",
    "quarterly review",
  ],
} as const

/**
 * Plan-tier feature gates and quotas.
 *
 * Naming after Phase 2 (PARA adoption):
 * - `maxProjects`            (was `maxGoalsPerPlan`) — kept as alias for back-compat through Phase 7
 * - `maxTasksPerProject`     NEW
 * - `maxSystemsPerProject`   (was `maxDailySystemsPerGoal`) — kept as alias for back-compat
 * - `maxAreas` / `maxCustomAreas`   NEW (PARA life domains)
 * - `maxVisionItems`         NEW (life vision board cards)
 * - `maxNotes`               NEW (across all parents)
 * - `maxResources` / `canUploadResourceFiles` / `maxResourceFileBytes` / `maxResourceStorageBytes`   NEW
 *   Free: link-only resources, no Vercel Blob writes (protects unit economics).
 *   Pro:  links + uploads, 25 MB per file, 2 GB total storage.
 * - `fullWrapped`            NEW (cinematic Wrapped — Pro only)
 *
 * Deprecated keys (kept for one phase, removed in Phase 7):
 * - `maxGoalsPerPlan`        → use `maxProjects`
 * - `maxDailySystemsPerGoal` → use `maxSystemsPerProject`
 */
export const planLimits = {
  FREE: {
    // ── core
    maxPlans: 1,
    maxAntiGoalsPerPlan: 3,

    // ── PARA quotas
    maxProjects: 3,
    maxTasksPerProject: 10,
    maxSystemsPerProject: 3,
    maxAreas: 6,
    maxCustomAreas: 0,
    maxVisionItems: 5,
    maxNotes: 20,

    // ── resources
    maxResources: 10,
    canUploadResourceFiles: false,
    maxResourceFileBytes: 0,
    maxResourceStorageBytes: 0,

    // ── feature gates
    quarterlyReview: false,
    advancedAnalytics: false,
    aiCoach: false,
    accountability: false,
    fullWrapped: false,
    streakShields: 0,

    // ── deprecated aliases (Phase 7 removes)
    /** @deprecated use `maxProjects` */
    maxGoalsPerPlan: 3,
    /** @deprecated use `maxSystemsPerProject` */
    maxDailySystemsPerGoal: 3,
  },
  PRO: {
    maxPlans: 5,
    maxAntiGoalsPerPlan: 50,

    maxProjects: 20,
    maxTasksPerProject: 200,
    maxSystemsPerProject: 10,
    maxAreas: 50,
    maxCustomAreas: 44, // 50 - 6 defaults
    maxVisionItems: 50,
    maxNotes: 5000,

    maxResources: 200,
    canUploadResourceFiles: true,
    maxResourceFileBytes: 25 * 1024 * 1024, //  25 MB
    maxResourceStorageBytes: 2 * 1024 * 1024 * 1024, //   2 GB

    quarterlyReview: true,
    advancedAnalytics: true,
    aiCoach: true,
    accountability: true,
    fullWrapped: true,
    streakShields: 2,

    /** @deprecated use `maxProjects` */
    maxGoalsPerPlan: 20,
    /** @deprecated use `maxSystemsPerProject` */
    maxDailySystemsPerGoal: 10,
  },
} as const

export type PlanTierKey = keyof typeof planLimits
