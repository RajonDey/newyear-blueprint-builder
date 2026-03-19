import type { Metadata } from "next"

export const metadata: Metadata = { title: "Year Wrapped" }

export default function WrappedPage() {
  return (
    <div className="max-w-2xl mx-auto text-center space-y-8 py-20">
      <h1 className="text-4xl font-bold">Your Year Wrapped</h1>
      <p className="text-muted-foreground">
        Available in December — a shareable summary of everything you achieved.
      </p>
      <div className="rounded-lg border p-8 text-muted-foreground">
        Year Wrapped will be built in Phase 4.
      </div>
    </div>
  )
}
