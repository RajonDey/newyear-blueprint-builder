-- CreateTable
CREATE TABLE "monthly_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "monthFocus" TEXT,
    "projectIntentions" JSONB,
    "topIntentions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_plans_planId_month_year_key" ON "monthly_plans"("planId", "month", "year");

-- AddForeignKey
ALTER TABLE "monthly_plans" ADD CONSTRAINT "monthly_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
