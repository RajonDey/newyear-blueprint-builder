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
    "goal tracking",
    "life planning",
    "wheel of life",
    "SMART goals",
    "habit tracking",
    "quarterly review",
  ],
} as const

export const planLimits = {
  FREE: {
    maxPlans: 1,
    maxGoalsPerPlan: 3,
    maxDailySystemsPerGoal: 3,
    quarterlyReview: false,
    advancedAnalytics: false,
    aiCoach: false,
    streakShields: 0,
    accountability: false,
  },
  PRO: {
    maxPlans: 5,
    maxGoalsPerPlan: 20,
    maxDailySystemsPerGoal: 10,
    quarterlyReview: true,
    advancedAnalytics: true,
    aiCoach: true,
    streakShields: 2,
    accountability: true,
  },
} as const

export type PlanTierKey = keyof typeof planLimits
