const STORAGE_KEY = "tasks:lastProjectId"

/** Remember the last project used when creating a task on `/tasks`. */
export function readLastTaskProjectId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeLastTaskProjectId(projectId: string) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, projectId)
  } catch {
    // ignore quota / private mode
  }
}

export function resolveDefaultTaskProjectId(
  projects: { id: string; type?: string }[],
  fallbackId?: string | null,
): string {
  if (projects.length === 0) return ""
  const fromStorage = readLastTaskProjectId()
  if (fromStorage && projects.some((p) => p.id === fromStorage)) {
    return fromStorage
  }
  if (fallbackId && projects.some((p) => p.id === fallbackId)) {
    return fallbackId
  }
  const primary = projects.find((p) => p.type === "PRIMARY")
  return primary?.id ?? projects[0].id
}
