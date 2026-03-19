import type { Metadata } from "next"

export const metadata: Metadata = { title: "Refund Policy" }

export default function RefundPage() {
  return (
    <div className="container max-w-3xl py-20 prose dark:prose-invert">
      <h1>Refund Policy</h1>
      <p className="text-muted-foreground">Last updated: March 2026</p>
      <p>We offer a 30-day money-back guarantee on all Pro subscriptions, no questions asked.</p>
    </div>
  )
}
