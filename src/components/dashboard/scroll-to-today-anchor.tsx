"use client"

import { useEffect } from "react"

/** Scrolls to `#today` when landing on `/dashboard#today` (hash is client-only). */
export function ScrollToTodayAnchor() {
  useEffect(() => {
    if (window.location.hash !== "#today") return
    document.getElementById("today")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return null
}
