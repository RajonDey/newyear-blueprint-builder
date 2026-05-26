import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://yearinreview.online"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/projects/", "/rhythm/", "/settings/", "/plan/", "/wrapped/", "/analytics/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
