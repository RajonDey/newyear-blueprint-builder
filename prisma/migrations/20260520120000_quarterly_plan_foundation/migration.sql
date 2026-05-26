-- CreateTable
CREATE TABLE "quarterly_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "quarter" "Quarter" NOT NULL,
    "year" INTEGER NOT NULL,
    "quarterFocus" TEXT,
    "projectIntentions" JSONB,
    "topIntentions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quarterly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quarterly_plans_planId_quarter_key" ON "quarterly_plans"("planId", "quarter");

-- AddForeignKey
ALTER TABLE "quarterly_plans" ADD CONSTRAINT "quarterly_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
