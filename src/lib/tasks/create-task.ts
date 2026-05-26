import { writeLastTaskProjectId } from "@/lib/tasks/last-project"

export type CreateTaskPayload = {
  projectId: string
  description: string
  targetDate?: string | null
}

export type CreateTaskResult =
  | { ok: true; taskId: string }
  | { ok: false; message: string; upgradeUrl?: string }

export async function createProjectTask(
  payload: CreateTaskPayload,
): Promise<CreateTaskResult> {
  const res = await fetch(`/api/projects/${payload.projectId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: payload.description.trim().slice(0, 500),
      type: "SMALL",
      targetDate: payload.targetDate ?? null,
    }),
  })

  const body = await res.json().catch(() => ({}))

  if (res.status === 402) {
    return {
      ok: false,
      message: body.message ?? "Task limit reached for this project.",
      upgradeUrl: body.upgradeUrl,
    }
  }

  if (!res.ok) {
    return {
      ok: false,
      message: body.message ?? body.error ?? "Could not add task.",
    }
  }

  writeLastTaskProjectId(payload.projectId)
  return { ok: true, taskId: body.data.id as string }
}
