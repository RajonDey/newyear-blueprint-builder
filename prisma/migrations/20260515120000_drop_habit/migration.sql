-- Phase 12: Drop the orphaned `Habit` model.
--
-- The Habit table was left behind in Phase 5 when the `System` model took
-- over for habit-style tracking (System has frequency, completions, and
-- archive state — everything Habit was meant to do but better integrated).
-- Nothing in the application reads or writes habits anymore; this drops
-- the table and its FK cleanly.

DROP TABLE IF EXISTS "habits";
