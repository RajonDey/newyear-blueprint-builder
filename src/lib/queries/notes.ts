import type { ParentType } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * Notes queries — the "N" in PARA's Notes/Resources pair.
 *
 * Notes are polymorphic via `(parentType, parentId)`. Every Note belongs to
 * exactly one user; ownership is enforced on every fetch by joining through
 * `Note.userId`. We never trust the client-supplied parent id without first
 * verifying that the parent itself belongs to the user — that check happens
 * in the API layer (`/api/notes`).
 */

export type NoteRow = {
  id: string
  parentType: ParentType
  parentId: string
  content: string
  pinned: boolean
  createdAt: Date
  updatedAt: Date
}

/** All notes attached to a single parent, newest first (pinned at the top). */
export async function getNotesForParent(
  userId: string,
  parentType: ParentType,
  parentId: string,
): Promise<NoteRow[]> {
  return db.note.findMany({
    where: { userId, parentType, parentId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })
}

/** Current note count, used for quota enforcement. */
export async function countNotesForUser(userId: string): Promise<number> {
  return db.note.count({ where: { userId } })
}

/** All notes across a list of parents — used by Area detail to pre-load. */
export async function getNotesForParents(
  userId: string,
  parents: { parentType: ParentType; parentId: string }[],
): Promise<NoteRow[]> {
  if (parents.length === 0) return []
  return db.note.findMany({
    where: {
      userId,
      OR: parents.map((p) => ({
        parentType: p.parentType,
        parentId: p.parentId,
      })),
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  })
}
