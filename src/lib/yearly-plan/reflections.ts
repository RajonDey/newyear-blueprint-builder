import { z } from "zod"

const reflectionsSchema = z
  .object({
    theme: z.string().trim().min(1).max(50).optional(),
    name: z.string().trim().max(100).nullable().optional(),
  })
  .passthrough()

export type PlanReflections = z.infer<typeof reflectionsSchema>

export function parsePlanReflections(
  value: unknown,
): PlanReflections | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null
  }
  const parsed = reflectionsSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export function getPlanTheme(reflections: unknown): string | null {
  const parsed = parsePlanReflections(reflections)
  return parsed?.theme?.trim() || null
}

export function mergePlanReflections(
  existing: unknown,
  patch: { theme?: string; name?: string | null },
): PlanReflections {
  const base = parsePlanReflections(existing) ?? {}
  return {
    ...base,
    ...(patch.theme !== undefined ? { theme: patch.theme } : {}),
    ...(patch.name !== undefined ? { name: patch.name } : {}),
  }
}
