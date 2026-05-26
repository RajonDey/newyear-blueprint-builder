import Link from "next/link"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AreaHealthTone } from "@/lib/queries/area-health"
import { areaHue } from "@/lib/level-styles"
import type { LifeCategory } from "@prisma/client"

const TONE_DOT: Record<AreaHealthTone, string> = {
  quiet: "bg-muted-foreground/25 ring-muted-foreground/15",
  green: "bg-emerald-500/85 ring-emerald-500/25",
  amber: "bg-amber/85 ring-amber/30",
}

type PulseArea = {
  id: string
  name: string
  category: LifeCategory | null
  health: { tone: AreaHealthTone; label: string }
}

export function AreasPulse({ areas }: { areas: PulseArea[] }) {
  if (areas.length === 0) return null

  return (
    <Link
      href="/areas"
      className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card/50 px-4 py-3 transition-colors hover:bg-card/80"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
        <Layers className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Areas pulse</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          How each life domain is feeling this week
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0" aria-label="Area health indicators">
        {areas.map((area) => {
          const hue = area.category ? areaHue[area.category] : "35 70% 50%"
          return (
            <span
              key={area.id}
              className="group relative flex flex-col items-center gap-1"
              title={`${area.name}: ${area.health.label}`}
            >
              <span
                className={cn(
                  "block h-3 w-3 rounded-full ring-2 ring-inset",
                  TONE_DOT[area.health.tone],
                )}
                style={{
                  boxShadow:
                    area.health.tone !== "quiet"
                      ? `0 0 0 1px hsl(${hue} / 0.35)`
                      : undefined,
                }}
              />
              <span className="hidden sm:block text-[9px] text-muted-foreground max-w-[3.5rem] truncate">
                {area.name.split(" ")[0]}
              </span>
            </span>
          )
        })}
      </div>
    </Link>
  )
}
