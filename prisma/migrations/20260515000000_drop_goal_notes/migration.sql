-- =====================================================================
-- Phase 7 cleanup — drop legacy goal_notes table.
--
-- Background: prior to the PARA refactor every reflection note hanging
-- off a project lived in `goal_notes`. Phase 2's `20260514000000_para_foundation`
-- migration copied every row into the new polymorphic `notes` table
-- (parentType = 'PROJECT', parentId = goalId, pinned = false) and the
-- product UI moved over to `<NotesBlock parentType="PROJECT" />` in
-- Phase 5. The `goal_notes` table has been read-dead since then.
--
-- This migration removes the now-orphaned table, its FK, and its index.
-- The corresponding `GoalNote` Prisma model and `Project.legacyNotes`
-- relation were removed from `prisma/schema/30-projects.prisma` in the
-- same commit so `prisma migrate diff` against the live DB stays clean.
-- =====================================================================

-- Drop the FK constraint first; PostgreSQL's `DROP TABLE` would cascade
-- but being explicit keeps this migration safe to replay in any order.
ALTER TABLE "public"."goal_notes" DROP CONSTRAINT IF EXISTS "goal_notes_goalId_fkey";

-- Drop the helper index defined on the table.
DROP INDEX IF EXISTS "public"."goal_notes_goalId_createdAt_idx";

-- Drop the table itself.
DROP TABLE IF EXISTS "public"."goal_notes";
