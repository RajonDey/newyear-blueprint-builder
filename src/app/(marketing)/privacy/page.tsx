import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-20 prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: March 2026</p>
      <p>Privacy policy content will be added here.</p>
    </div>
  )
}
