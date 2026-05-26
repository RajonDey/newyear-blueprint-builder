import { redirect } from "next/navigation"

/**
 * Legacy route — replaced by `/onboarding` (first-run wizard) and per-section
 * planning on `/areas`, `/goals`, `/systems`. We keep a permanent redirect so
 * existing emails, bookmarks, and any third-party deep links continue to land
 * the user somewhere useful instead of 404-ing.
 */
export default function NewPlanRedirect() {
  redirect("/onboarding")
}
