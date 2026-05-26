import type { Metadata } from "next"
import { DailyRhythmRedirect } from "@/components/rhythm/daily-rhythm-redirect"

export const metadata: Metadata = {
  title: "Today",
  description: "Your daily systems checklist lives on the Dashboard.",
}

/** Legacy route — bookmarks still work; canonical home is `/dashboard#today`. */
export default function DailyRhythmRedirectPage() {
  return <DailyRhythmRedirect />
}
