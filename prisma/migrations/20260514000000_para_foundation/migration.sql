-- CreateEnum
CREATE TYPE "ParentType" AS ENUM ('AREA', 'PROJECT', 'TASK', 'SYSTEM', 'VISION', 'VISION_ITEM');

-- CreateEnum
CREATE TYPE "ResourceKind" AS ENUM ('LINK', 'FILE');

-- CreateEnum
CREATE TYPE "VisionItemKind" AS ENUM ('STATEMENT', 'VALUE', 'MILESTONE', 'IMAGE', 'QUOTE');

-- CreateEnum
CREATE TYPE "DriftKind" AS ENUM ('THOUGHT', 'TASK', 'NOTE', 'RESOURCE', 'QUESTION');

-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "areaId" TEXT;

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#d4a05c',
    "icon" TEXT,
    "description" TEXT,
    "category" "LifeCategory",
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "northStar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vision_items" (
    "id" TEXT NOT NULL,
    "visionId" TEXT NOT NULL,
    "areaId" TEXT,
    "kind" "VisionItemKind" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vision_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentType" "ParentType" NOT NULL,
    "parentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentType" "ParentType" NOT NULL,
    "parentId" TEXT NOT NULL,
    "kind" "ResourceKind" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drifts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "kind" "DriftKind" NOT NULL DEFAULT 'THOUGHT',
    "resolvedAt" TIMESTAMP(3),
    "resolvedAs" TEXT,
    "resolvedRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_states" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "mood" INTEGER,
    "energy" INTEGER,
    "intention" TEXT,
    "reflection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "areas_userId_sortOrder_idx" ON "areas"("userId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "visions_userId_key" ON "visions"("userId");

-- CreateIndex
CREATE INDEX "vision_items_visionId_order_idx" ON "vision_items"("visionId", "order");

-- CreateIndex
CREATE INDEX "notes_parentType_parentId_createdAt_idx" ON "notes"("parentType", "parentId", "createdAt");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- CreateIndex
CREATE INDEX "resources_parentType_parentId_idx" ON "resources"("parentType", "parentId");

-- CreateIndex
CREATE INDEX "resources_userId_kind_idx" ON "resources"("userId", "kind");

-- CreateIndex
CREATE INDEX "drifts_userId_createdAt_idx" ON "drifts"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "drifts_userId_resolvedAt_idx" ON "drifts"("userId", "resolvedAt");

-- CreateIndex
CREATE INDEX "daily_states_userId_date_idx" ON "daily_states"("userId", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "daily_states_userId_date_key" ON "daily_states"("userId", "date");

-- CreateIndex
CREATE INDEX "goals_areaId_idx" ON "goals"("areaId");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visions" ADD CONSTRAINT "visions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vision_items" ADD CONSTRAINT "vision_items_visionId_fkey" FOREIGN KEY ("visionId") REFERENCES "visions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vision_items" ADD CONSTRAINT "vision_items_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drifts" ADD CONSTRAINT "drifts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_states" ADD CONSTRAINT "daily_states_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- PARA data seeding (Phase 2)
-- ─────────────────────────────────────────────────────────────

-- 1. Seed six default Areas for every existing user, keyed to LifeCategory
--    so legacy projects can back-fill via the category mapping in step 2.
INSERT INTO "areas" ("id", "userId", "name", "color", "icon", "description", "category", "isDefault", "sortOrder", "createdAt", "updatedAt")
SELECT
  CONCAT('area_', u.id, '_', area_def.cat) AS id,
  u.id,
  area_def.name,
  area_def.color,
  area_def.icon,
  area_def.description,
  area_def.cat::"LifeCategory",
  TRUE,
  area_def.sort_order,
  NOW(),
  NOW()
FROM "users" u
CROSS JOIN (
  VALUES
    ('HEALTH',        'Health',         '#22c55e', 'Heart',         'Body, mind, recovery, sleep.',                                   0),
    ('CAREER',        'Career',         '#3b82f6', 'Briefcase',     'Work, craft, learning, professional growth.',                    1),
    ('FINANCE',       'Finance',        '#f59e0b', 'Wallet',        'Income, savings, investments, financial literacy.',              2),
    ('RELATIONSHIPS', 'Relationships',  '#ec4899', 'Users',         'Family, friendships, partners, community.',                       3),
    ('SPIRITUALITY',  'Spirituality',   '#a855f7', 'Sparkles',      'Purpose, contemplation, gratitude, inner life.',                  4),
    ('PASSION',       'Passion',        '#d4a05c', 'Star',          'Creative pursuits, hobbies, things that light you up.',           5)
) AS area_def(cat, name, color, icon, description, sort_order)
ON CONFLICT DO NOTHING;

-- 2. Back-fill `goals.areaId` from `goals.category` using the default area
--    we just seeded. (Schema-only-renamed to "Project" — table still `goals`.)
UPDATE "goals" g
SET "areaId" = a.id
FROM "areas" a, "yearly_plans" yp
WHERE g."planId" = yp.id
  AND a."userId" = yp."userId"
  AND a."isDefault" = TRUE
  AND a."category" = g."category"
  AND g."areaId" IS NULL;

-- 3. Seed an empty Vision row (one per user) so the life vision board is
--    always reachable. Items start empty; UI prompts the user to add cards.
INSERT INTO "visions" ("id", "userId", "northStar", "createdAt", "updatedAt")
SELECT CONCAT('vision_', u.id), u.id, NULL, NOW(), NOW()
FROM "users" u
ON CONFLICT ("userId") DO NOTHING;

-- 4. Copy legacy `goal_notes` into the new polymorphic `notes` table so
--    Phase 5 ships without losing reflection notes. The `goal_notes` table
--    itself stays for one phase as a deprecated mirror (dropped in Phase 7).
INSERT INTO "notes" ("id", "userId", "parentType", "parentId", "content", "pinned", "createdAt", "updatedAt")
SELECT
  CONCAT('note_legacy_', gn.id),
  yp."userId",
  'PROJECT',
  gn."goalId",
  gn."content",
  FALSE,
  gn."createdAt",
  gn."createdAt"
FROM "goal_notes" gn
JOIN "goals" g ON gn."goalId" = g.id
JOIN "yearly_plans" yp ON g."planId" = yp.id
ON CONFLICT DO NOTHING;

