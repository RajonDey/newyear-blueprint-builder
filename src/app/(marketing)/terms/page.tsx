import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-20 prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: March 2026</p>
      <p>Terms of service content will be added here.</p>
    </div>
  )
}
