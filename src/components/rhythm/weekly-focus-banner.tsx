import Link from "next/link"
import { Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LIFE_CATEGORIES } from "@/lib/constants/categories"

export function WeeklyFocusBanner({
  projects,
  protectCategory,
}: {
  projects: { id: string; title: string }[]
  protectCategory: string | null
}) {
  if (projects.length === 0 && !protectCategory) return null

  const protectLabel = protectCategory
    ? LIFE_CATEGORIES.find((c) => c.id === protectCategory)?.label ??
      protectCategory
    : null

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-accent/20 bg-accent/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-accent" />
          This week you&apos;re focused on
        </p>
        {projects.length > 0 && (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {projects.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/projects/${g.id}`}
                  className="font-medium text-accent hover:underline"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {protectLabel && (
          <p className="text-xs text-muted-foreground">
            Protecting{" "}
            <span className="font-medium text-foreground">{protectLabel}</span>
          </p>
        )}
      </div>
      <Button variant="outline" size="sm" className="shrink-0 w-full sm:w-auto" asChild>
        <Link href="/rhythm/weekly">Weekly planner</Link>
      </Button>
    </div>
  )
}
