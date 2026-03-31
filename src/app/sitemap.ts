import type { MetadataRoute } from "next"
import { getBaseUrl } from "@/lib/utils"
import { getAllWisdomMeta } from "@/lib/wisdom"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl()

  const now = new Date()
  const wisdomPosts = getAllWisdomMeta().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: (() => {
      const d = new Date(p.date)
      return Number.isNaN(d.getTime()) ? now : d
    })(),
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }))

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...wisdomPosts,
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy/california`, lastModified: now, changeFrequency: "yearly", priority: 0.25 },
    { url: `${base}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.25 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]
}
