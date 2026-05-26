import { redirect } from "next/navigation"

/** Legacy alias — canonical route is `/knowledge/notes`. */
export default async function NotesRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value)
  }
  const suffix = q.toString()
  redirect(suffix ? `/knowledge/notes?${suffix}` : "/knowledge/notes")
}
