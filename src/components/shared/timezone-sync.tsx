"use client"

import { useEffect, useRef } from "react"

type TimezoneSyncProps = {
  initialTimezone: string
}

/**
 * Sets timezone from the browser on first app visit when still on UTC default.
 * Users can override anytime in Settings.
 */
export function TimezoneSync({ initialTimezone }: TimezoneSyncProps) {
  const synced = useRef(false)

  useEffect(() => {
    if (synced.current) return
    if (initialTimezone !== "UTC") return

    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (!detected || detected === "UTC") return

    synced.current = true
    void fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: detected }),
    })
  }, [initialTimezone])

  return null
}
