import type { Metadata } from "next"
import { requireAuth } from "@/lib/auth-guard"
import { WrappedSummary } from "@/components/wrapped/wrapped-summary"

export const metadata: Metadata = { title: "Year Wrapped" }

export default async function WrappedPage() {
  await requireAuth()

  return <WrappedSummary />
}
