import { getSupportEmail } from "@/lib/legal"

/** Shown on Help page and Settings — sets expectations for early-stage support. */
export const SUPPORT_REPLY_SLA = "within 2 business days"

export function buildSupportMailto(options?: {
  subject?: string
  body?: string
}): string {
  const email = getSupportEmail()
  const params = new URLSearchParams()
  if (options?.subject) params.set("subject", options.subject)
  if (options?.body) params.set("body", options.body)
  const query = params.toString()
  return query ? `mailto:${email}?${query}` : `mailto:${email}`
}
