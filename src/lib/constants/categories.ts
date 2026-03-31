import {
  Heart,
  Briefcase,
  DollarSign,
  Users,
  Sparkles,
  Flame,
  type LucideIcon,
} from "lucide-react"

export const LIFE_CATEGORIES = [
  {
    id: "HEALTH" as const,
    label: "Health",
    icon: Heart,
    color: "hsl(142 71% 45%)",
    description: "Physical and mental wellbeing",
  },
  {
    id: "CAREER" as const,
    label: "Career",
    icon: Briefcase,
    color: "hsl(217 91% 60%)",
    description: "Professional growth and work",
  },
  {
    id: "FINANCE" as const,
    label: "Finance",
    icon: DollarSign,
    color: "hsl(38 92% 50%)",
    description: "Money, savings, and investments",
  },
  {
    id: "RELATIONSHIPS" as const,
    label: "Relationships",
    icon: Users,
    color: "hsl(340 82% 52%)",
    description: "Family, friends, and community",
  },
  {
    id: "SPIRITUALITY" as const,
    label: "Spirituality",
    icon: Sparkles,
    color: "hsl(255 75% 65%)",
    description: "Purpose, mindfulness, and inner growth",
  },
  {
    id: "PASSION" as const,
    label: "Passion",
    icon: Flame,
    color: "hsl(0 84% 60%)",
    description: "Hobbies, creativity, and joy",
  },
] as const

export type LifeCategoryId = (typeof LIFE_CATEGORIES)[number]["id"]

export function getCategoryById(id: LifeCategoryId) {
  return LIFE_CATEGORIES.find((c) => c.id === id)!
}
