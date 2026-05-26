-- PC-18: optional link from yearly projects to life-vision board cards.

ALTER TABLE "goals" ADD COLUMN "visionItemId" TEXT;

CREATE INDEX "goals_visionItemId_idx" ON "goals"("visionItemId");

ALTER TABLE "goals" ADD CONSTRAINT "goals_visionItemId_fkey"
  FOREIGN KEY ("visionItemId") REFERENCES "vision_items"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
