-- Hot-path FK indexes for list and detail queries (Phase D).
CREATE INDEX IF NOT EXISTS "goals_planId_idx" ON "goals"("planId");
CREATE INDEX IF NOT EXISTS "actions_goalId_idx" ON "actions"("goalId");
CREATE INDEX IF NOT EXISTS "daily_systems_goalId_idx" ON "daily_systems"("goalId");
CREATE INDEX IF NOT EXISTS "key_results_goalId_idx" ON "key_results"("goalId");
