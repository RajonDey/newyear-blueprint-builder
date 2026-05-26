"use client"

import { useEffect } from "react"
import { DAILY_HOME_HREF } from "@/lib/app-routes"

/** Legacy `/rhythm/daily` → canonical Today surface on the Dashboard. */
export function DailyRhythmRedirect() {
  useEffect(() => {
    window.location.replace(DAILY_HOME_HREF)
  }, [])

  return (
    <p className="px-6 py-8 text-sm text-muted-foreground">
      Opening Today on your Dashboard…
    </p>
  )
}
