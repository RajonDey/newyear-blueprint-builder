/** Display string for “last updated” on legal pages. */
export const LEGAL_LAST_UPDATED = "March 20, 2026"

export const SITE_LEGAL_NAME = "YearInReview"

/** Production public hostname used in legal/policy text when APP_URL is unset or non-public. */
export const CANONICAL_PUBLIC_DOMAIN = "yearinreview.online"

function stripHostFromInput(raw: string): string {
  const s = raw.trim()
  if (!s) return ""
  try {
    if (s.includes("://")) return new URL(s).hostname
    return s.split("/")[0]?.split(":")[0] ?? ""
  } catch {
    return ""
  }
}

function isNonPublicLegalHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (!h) return true
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "[::1]" ||
    h === "0.0.0.0" ||
    h === "host.docker.internal"
  )
    return true
  if (h.endsWith(".local")) return true
  if (h.startsWith("192.168.")) return true
  if (h.startsWith("10.")) return true
  if (h.startsWith("172.")) {
    const parts = h.split(".")
    const second = parseInt(parts[1] ?? "", 10)
    if (!Number.isNaN(second) && second >= 16 && second <= 31) return true
  }
  return false
}

export function getSupportEmail(): string {
  const v = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim()
  return v && v.length > 0 ? v : "support@yearinreview.online"
}

/**
 * Hostname shown in Terms, Privacy, Cookies, and the legal footer.
 * Never returns localhost or private-network hosts—avoids shipping dev URLs in production policies.
 * Set NEXT_PUBLIC_LEGAL_SITE_DOMAIN (e.g. yearinreview.online) if it differs from NEXT_PUBLIC_APP_URL.
 */
export function getSiteDomain(): string {
  const legalOverride = process.env.NEXT_PUBLIC_LEGAL_SITE_DOMAIN?.trim()
  if (legalOverride) {
    const host = stripHostFromInput(legalOverride)
    if (host && !isNonPublicLegalHost(host)) return host
  }

  const url = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (!url) return CANONICAL_PUBLIC_DOMAIN
  try {
    const hostname = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
    if (!hostname || isNonPublicLegalHost(hostname)) return CANONICAL_PUBLIC_DOMAIN
    return hostname
  } catch {
    return CANONICAL_PUBLIC_DOMAIN
  }
}

/** Canonical https origin for legal copy (no trailing slash). */
export function getSiteOriginForLegal(): string {
  return `https://${getSiteDomain()}`
}
