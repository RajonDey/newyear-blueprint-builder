-- Phase 13: Custom Monthly / Quarterly review field templates.

CREATE TYPE "ReviewCadence" AS ENUM ('MONTHLY', 'QUARTERLY');

CREATE TABLE "review_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cadence" "ReviewCadence" NOT NULL,
    "fields" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "review_templates_userId_cadence_key" ON "review_templates"("userId", "cadence");

ALTER TABLE "review_templates" ADD CONSTRAINT "review_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "monthly_reviews" ADD COLUMN "responses" JSONB;
ALTER TABLE "quarterly_reviews" ADD COLUMN "responses" JSONB;
