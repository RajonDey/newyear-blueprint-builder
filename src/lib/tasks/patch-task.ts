import type { ActionType, GoalStatus } from "@prisma/client"

export type PatchTaskPayload = {
  description?: string
  type?: ActionType
  targetDate?: string | null
  projectId?: string
  status?: GoalStatus
  done?: boolean
}

export type PatchTaskResult =
  | { ok: true }
  | { ok: false; message: string }

export async function patchProjectTask(
  taskId: string,
  payload: PatchTaskPayload,
): Promise<PatchTaskResult> {
  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    return {
      ok: false,
      message: body.message ?? body.error ?? "Could not update task.",
    }
  }

  return { ok: true }
}
