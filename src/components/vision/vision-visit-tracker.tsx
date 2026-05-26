"use client"

import { useEffect, useRef } from "react"

/** Records a vision page visit for the week-one dashboard checklist (PC-14). */
export function VisionVisitTracker() {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    void fetch("/api/user/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordVisionVisit: true }),
    }).catch(() => {
      sent.current = false
    })
  }, [])

  return null
}
