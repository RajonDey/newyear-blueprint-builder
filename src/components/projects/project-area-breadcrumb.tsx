import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { LifeCategory } from "@prisma/client"
import { areaHue, areaIcon } from "@/lib/level-styles"

interface ProjectAreaBreadcrumbProps {
  category: LifeCategory
  area: { id: string; name: string } | null
}

/**
 * The YIR-style breadcrumb that sits at the top of `/projects/[projectId]`.
 * If the project anchors to an Area, links back to that area; otherwise
 * falls back to `/projects`.
 */
export function ProjectAreaBreadcrumb({
  category,
  area,
}: ProjectAreaBreadcrumbProps) {
  const Icon = areaIcon[category]
  const hue = areaHue[category]
  const href = area ? `/areas/${encodeURIComponent(area.id)}` : "/projects"
  const label = area ? area.name : "All projects"

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      <Icon className="h-3.5 w-3.5" style={{ color: `hsl(${hue})` }} />
      <span>{label}</span>
    </Link>
  )
}
