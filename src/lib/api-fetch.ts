"use client"

import { toast } from "sonner"

export type ApiFetchResult<T> =
  | { ok: true; data: T; status: number; body: unknown }
  | { ok: false; error: string; status: number; body: unknown }

export type ApiFetchOptions = RequestInit & {
  /** Shown when the response has no message/error field */
  errorMessage?: string
  /** Skip toast on failure */
  silent?: boolean
}

/**
 * Client-side fetch wrapper aligned with API `{ data }` / `{ error }` envelopes.
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: ApiFetchOptions = {},
): Promise<ApiFetchResult<T>> {
  const { errorMessage, silent, ...init } = options
  const res = await fetch(url, init)
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const err =
      (body &&
        typeof body === "object" &&
        ("message" in body
          ? String((body as { message?: string }).message)
          : "error" in body
            ? String((body as { error?: string }).error)
            : null)) ||
      errorMessage ||
      "Something went wrong"
    if (!silent) toast.error(err)
    return { ok: false, error: err, status: res.status, body }
  }

  const data =
    body && typeof body === "object" && "data" in body
      ? (body as { data: T }).data
      : (body as T)

  return { ok: true, data, status: res.status, body }
}
