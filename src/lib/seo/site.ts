import { getBaseUrl } from "@/lib/utils"

export const SITE_NAME = "YearInReview"

export const SITE_TAGLINE = "Design a life worth living"

export const SITE_DESCRIPTION =
  "A calm annual planning platform that connects your yearly plan, weekly rhythm, and daily systems — so intentions turn into habits, not guilt."

export const SITE_KEYWORDS = [
  "year planning",
  "annual goals",
  "annual review",
  "weekly rhythm",
  "wheel of life",
  "anti-goals",
  "intentional living",
  "life design",
  "mindful planning",
  "personal growth",
] as const

export function getSiteUrl(path = ""): string {
  const base = getBaseUrl().replace(/\/$/, "")
  if (!path) return base
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export const ORGANIZATION = {
  name: SITE_NAME,
  url: getSiteUrl(),
  logoUrl: getSiteUrl("/icon.svg"),
  email: process.env.SUPPORT_EMAIL ?? "support@yearinreview.online",
} as const
