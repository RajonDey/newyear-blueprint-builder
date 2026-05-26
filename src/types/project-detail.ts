import type { getProjectById } from "@/lib/queries/projects"

/** Serialized project graph for the detail page and section components. */
export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProjectById>>
>
