-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('SMALL', 'MEDIUM', 'BIG');

-- CreateEnum
CREATE TYPE "public"."Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "public"."GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_TRACK', 'AT_RISK', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "public"."GoalType" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "public"."LifeCategory" AS ENUM ('HEALTH', 'CAREER', 'FINANCE', 'RELATIONSHIPS', 'SPIRITUALITY', 'PASSION');

-- CreateEnum
CREATE TYPE "public"."PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PlanTier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "public"."Quarter" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."StreakType" AS ENUM ('WEEKLY_CHECK_IN', 'DAILY_SYSTEM');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."actions" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" "public"."ActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "targetDate" TIMESTAMP(3),

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."anti_goals" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "public"."LifeCategory",

    CONSTRAINT "anti_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checkpoint_goals" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "quarter" "public"."Quarter" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "targetDate" TIMESTAMP(3),

    CONSTRAINT "checkpoint_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."daily_systems" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "public"."Frequency" NOT NULL DEFAULT 'DAILY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "daily_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goal_check_ins" (
    "id" TEXT NOT NULL,
    "weeklyCheckInId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "progressRating" INTEGER NOT NULL,
    "notes" TEXT,
    "blockers" TEXT,

    CONSTRAINT "goal_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goal_notes" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."goals" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "category" "public"."LifeCategory" NOT NULL,
    "type" "public"."GoalType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."habits" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "routineFormula" TEXT,
    "frequency" "public"."Frequency" NOT NULL DEFAULT 'MONTHLY',

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."key_results" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "key_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."monthly_reviews" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "summary" TEXT,
    "winsText" TEXT,
    "challengesText" TEXT,
    "adjustments" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."motivations" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "whyText" TEXT NOT NULL,
    "consequenceText" TEXT NOT NULL,

    CONSTRAINT "motivations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."quarterly_reviews" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "quarter" "public"."Quarter" NOT NULL,
    "summary" TEXT,
    "winsText" TEXT,
    "challengesText" TEXT,
    "adjustments" TEXT,
    "wheelOfLifeSnapshot" JSONB,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quarterly_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streaks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."StreakType" NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastCompletedAt" TIMESTAMP(3),
    "shieldsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lsCustomerId" TEXT NOT NULL,
    "lsSubscriptionId" TEXT,
    "lsVariantId" TEXT,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."system_completions" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL,

    CONSTRAINT "system_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "planTier" "public"."PlanTier" NOT NULL DEFAULT 'FREE',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."weekly_check_ins" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "overallMood" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextWeekFocus" TEXT,

    CONSTRAINT "weekly_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."weekly_plans" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "priorityGoalIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "protectCategory" "public"."LifeCategory",
    "commitments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."wheel_of_life_entries" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "category" "public"."LifeCategory" NOT NULL,
    "rating" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "context" TEXT,

    CONSTRAINT "wheel_of_life_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."yearly_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "public"."PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reflections" JSONB,

    CONSTRAINT "yearly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider" ASC, "providerAccountId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_userId_type_key" ON "public"."achievements"("userId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "goal_check_ins_weeklyCheckInId_goalId_key" ON "public"."goal_check_ins"("weeklyCheckInId" ASC, "goalId" ASC);

-- CreateIndex
CREATE INDEX "goal_notes_goalId_createdAt_idx" ON "public"."goal_notes"("goalId" ASC, "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_reviews_planId_month_year_key" ON "public"."monthly_reviews"("planId" ASC, "month" ASC, "year" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "motivations_goalId_key" ON "public"."motivations"("goalId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "quarterly_reviews_planId_quarter_key" ON "public"."quarterly_reviews"("planId" ASC, "quarter" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "streaks_userId_type_key" ON "public"."streaks"("userId" ASC, "type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_lsCustomerId_key" ON "public"."subscriptions"("lsCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_lsSubscriptionId_key" ON "public"."subscriptions"("lsSubscriptionId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "public"."subscriptions"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "system_completions_systemId_date_key" ON "public"."system_completions"("systemId" ASC, "date" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier" ASC, "token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "weekly_check_ins_planId_weekNumber_year_key" ON "public"."weekly_check_ins"("planId" ASC, "weekNumber" ASC, "year" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "weekly_plans_planId_weekNumber_year_key" ON "public"."weekly_plans"("planId" ASC, "weekNumber" ASC, "year" ASC);

-- CreateIndex
CREATE INDEX "wheel_of_life_entries_planId_recordedAt_idx" ON "public"."wheel_of_life_entries"("planId" ASC, "recordedAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "yearly_plans_userId_year_key" ON "public"."yearly_plans"("userId" ASC, "year" ASC);

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."achievements" ADD CONSTRAINT "achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."actions" ADD CONSTRAINT "actions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anti_goals" ADD CONSTRAINT "anti_goals_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checkpoint_goals" ADD CONSTRAINT "checkpoint_goals_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."daily_systems" ADD CONSTRAINT "daily_systems_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_check_ins" ADD CONSTRAINT "goal_check_ins_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_check_ins" ADD CONSTRAINT "goal_check_ins_weeklyCheckInId_fkey" FOREIGN KEY ("weeklyCheckInId") REFERENCES "public"."weekly_check_ins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goal_notes" ADD CONSTRAINT "goal_notes_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."goals" ADD CONSTRAINT "goals_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."habits" ADD CONSTRAINT "habits_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."key_results" ADD CONSTRAINT "key_results_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."monthly_reviews" ADD CONSTRAINT "monthly_reviews_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."motivations" ADD CONSTRAINT "motivations_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."quarterly_reviews" ADD CONSTRAINT "quarterly_reviews_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streaks" ADD CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."system_completions" ADD CONSTRAINT "system_completions_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."daily_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_check_ins" ADD CONSTRAINT "weekly_check_ins_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."weekly_plans" ADD CONSTRAINT "weekly_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wheel_of_life_entries" ADD CONSTRAINT "wheel_of_life_entries_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."yearly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."yearly_plans" ADD CONSTRAINT "yearly_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

