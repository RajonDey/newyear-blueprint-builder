import { z } from "zod"

const lifeCategoryEnum = z.enum([
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
])

const goalTypeEnum = z.enum(["PRIMARY", "SECONDARY"])
const quarterEnum = z.enum(["Q1", "Q2", "Q3", "Q4"])
const frequencyEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"])

export const wizardSubmitSchema = z.object({
  year: z.number().int().min(2024).max(2100),

  reflections: z.object({
    wins: z.string().max(5000),
    challenges: z.string().max(5000),
    gratitude: z.string().max(5000),
    lessons: z.string().max(5000),
  }),

  wheelEntries: z
    .array(
      z.object({
        category: lifeCategoryEnum,
        rating: z.number().int().min(1).max(10),
      })
    )
    .min(6)
    .max(6),

  wheelContext: z.string().max(2000).optional(),

  goals: z
    .array(
      z.object({
        category: lifeCategoryEnum,
        type: goalTypeEnum,
        title: z.string().min(1).max(500),
        description: z.string().max(2000).optional(),
        motivation: z.object({
          whyText: z.string().max(2000),
          consequenceText: z.string().max(2000),
        }),
        checkpoints: z.array(
          z.object({
            quarter: quarterEnum,
            title: z.string().min(1).max(500),
            description: z.string().max(2000).optional(),
          })
        ),
        systems: z.array(
          z.object({
            description: z.string().min(1).max(500),
            frequency: frequencyEnum,
          })
        ),
      })
    )
    .min(1),

  antiGoals: z.array(
    z.object({
      description: z.string().min(1).max(1000),
      category: lifeCategoryEnum.optional(),
    })
  ),
})

export type WizardSubmitData = z.infer<typeof wizardSubmitSchema>
