-- PC-14: optional JSON preferences (week-1 checklist dismiss, vision visit, etc.)

ALTER TABLE "users" ADD COLUMN "preferences" JSONB;
