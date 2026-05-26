-- AlterTable
ALTER TABLE "daily_states" ADD COLUMN "antiGoalHeldId" TEXT,
ADD COLUMN "antiGoalHeld" BOOLEAN;

-- Backfill legacy `anti-goal:<id>=held|slipped` prefixes from reflection text.
UPDATE "daily_states"
SET
  "antiGoalHeldId" = (regexp_match("reflection", '^anti-goal:([^=\n]+)=(held|slipped)\n\n'))[1],
  "antiGoalHeld" = CASE (regexp_match("reflection", '^anti-goal:([^=\n]+)=(held|slipped)\n\n'))[2]
    WHEN 'held' THEN TRUE
    WHEN 'slipped' THEN FALSE
    ELSE NULL
  END,
  "reflection" = NULLIF(
    substring("reflection" FROM '^anti-goal:[^=\n]+=(held|slipped)\n\n(.*)$'),
    ''
  )
WHERE "reflection" ~ '^anti-goal:[^=\n]+=(held|slipped)\n\n';

-- AddForeignKey
ALTER TABLE "daily_states" ADD CONSTRAINT "daily_states_antiGoalHeldId_fkey" FOREIGN KEY ("antiGoalHeldId") REFERENCES "anti_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
