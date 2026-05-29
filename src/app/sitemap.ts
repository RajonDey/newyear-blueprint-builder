import type { MetadataRoute } from "next"
import { getBaseUrl } from "@/lib/utils"
import {
  getAllWisdomMeta,
  getLatestWisdomModifiedDate,
  getWisdomLastModified,
  parseWisdomDate,
} from "@/lib/wisdom"

/** Re-read MDX posts and marketing routes on a schedule (new posts appear without a manual rebuild). */
export const revalidate = 3600

type MarketingRoute = {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]
  priority: number
}

const MARKETING_ROUTES: MarketingRoute[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
  { path: "/how-it-works", changeFrequency: "monthly", priority: 0.85 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/help", changeFrequency: "monthly", priority: 0.65 },
  { path: "/signup", changeFrequency: "monthly", priority: 0.85 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy/california", changeFrequency: "yearly", priority: 0.25 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.25 },
  { path: "/refund", changeFrequency: "yearly", priority: 0.3 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl()
  const now = new Date()
  const latestBlogModified = getLatestWisdomModifiedDate() ?? now

  const wisdomPosts = getAllWisdomMeta().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: parseWisdomDate(getWisdomLastModified(post)) ?? now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }))

  const marketingEntries = MARKETING_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))

  return [
    ...marketingEntries,
    {
      url: `${base}/blog`,
      lastModified: latestBlogModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...wisdomPosts,
  ]
}
