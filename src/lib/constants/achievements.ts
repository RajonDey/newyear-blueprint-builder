export const ACHIEVEMENTS = {
  first_check_in: {
    type: "first_check_in",
    title: "First Step",
    description: "Completed your first weekly check-in",
    icon: "🎯",
  },
  streak_4: {
    type: "streak_4",
    title: "Consistent",
    description: "4-week check-in streak",
    icon: "🔥",
  },
  streak_12: {
    type: "streak_12",
    title: "Dedicated",
    description: "12-week check-in streak — that's a full quarter!",
    icon: "⚡",
  },
  streak_26: {
    type: "streak_26",
    title: "Half Year Hero",
    description: "26-week streak — halfway through the year",
    icon: "🏆",
  },
  streak_52: {
    type: "streak_52",
    title: "Year Master",
    description: "52-week streak — a full year of consistency",
    icon: "👑",
  },
  quarter_complete: {
    type: "quarter_complete",
    title: "Quarter Done",
    description: "Completed a quarterly review",
    icon: "📊",
  },
  goal_completed: {
    type: "goal_completed",
    title: "Goal Crusher",
    description: "Marked a goal as completed",
    icon: "✅",
  },
  all_systems_day: {
    type: "all_systems_day",
    title: "Perfect Day",
    description: "Completed all daily systems in one day",
    icon: "💯",
  },
  plan_created: {
    type: "plan_created",
    title: "Architect",
    description: "Created your first year plan",
    icon: "📐",
  },
  year_wrapped: {
    type: "year_wrapped",
    title: "Year in Review",
    description: "Generated your Year Wrapped summary",
    icon: "🎉",
  },
} as const

export type AchievementType = keyof typeof ACHIEVEMENTS
