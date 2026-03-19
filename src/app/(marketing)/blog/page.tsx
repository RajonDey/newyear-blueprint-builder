import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on annual planning, goal setting, and personal growth.",
}

export default function BlogPage() {
  return (
    <div className="container py-20">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-muted-foreground mb-12">
        Insights on annual planning, goal setting, and personal growth.
      </p>
      <div className="text-center py-16 text-muted-foreground">
        Coming soon — articles on year planning frameworks, goal tracking, and more.
      </div>
    </div>
  )
}
