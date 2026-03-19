import type { MetadataRoute } from "next"
import { getBaseUrl } from "@/lib/utils"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getBaseUrl()

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]
}
