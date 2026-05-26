> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Dashboard Improvisation — Master Plan (final)

**Status:** Locked. Phase 2 next.
**Target ship date:** end of May 2026 (~2 weeks from 2026-05-14)
**Source-of-truth pricing:** `src/lib/config.ts` · `src/lib/plan-access.ts`
**Design reference:** `/Users/rajondey/Developer/Personal/yearinreview/` (Lovable)
**Design philosophy:** PARA / Second Brain — see [`PARA.md`](./PARA.md)

---

## 0. Executive summary

NBB rebuilds its dashboard around PARA / Second Brain. The product becomes:

> A planning tool to achieve and unlock success in an aligned, focused way.

The plan-execute-review-learn loop is reflected in the sidebar groups:

```
Dashboard
Foundation   →  Wheel of Life · Vision · Areas
Planning     →  Projects · Tasks · Systems
Rhythm       →  Weekly · Monthly · Quarterly
Insights     →  Analytics · Year Wrapped
Account      →  Settings
```

**Cross-cutting (embedded, no dedicated pages):**
- **Anti-Goals** — surfaced in Vision, Project detail, Weekly/Monthly reviews, TodayCard
- **Drifts** — Quick Capture → Drift → Process (inbox affordance)
- **Notes / Resources / Links** — attachable to Area, Project, Task, System, Vision

**Phase status:** 0 ✅, 1 ✅, 2–7 to do. ~6 phases ≈ 6–10 working days at one phase/day.

---

## 1. Locked decisions

| Topic | Decision | Effect |
|---|---|---|
| Structural model | **PARA** (Areas → Projects → Tasks + Notes/Resources transversal) | Final |
| `Goal` → `Project` | Renamed in code/URLs/UI/marketing; DB tables kept via Prisma `@@map` | Phase 2 |
| `Action` → `Task` | Renamed in code; DB stays `actions` | Phase 2 |
| `DailySystem` → `System` | Renamed in code; DB stays `daily_systems` | Phase 2 |
| `Area` | New entity, 6 defaults Free, custom Pro-only | Phase 2 (schema) + 3 (UI) |
| `Vision` | New Prisma model — **one per User, life-spanning** (not tied to a year). Holds north-star statement + multi-card `VisionItem` board. | Phase 2 (schema) + 3 (UI) |
| `Wheel` | Dedicated `/wheel` surface (data already in `WheelOfLifeEntry`) | Phase 3 |
| Top-level `/tasks` & `/systems` | New surfaces in Planning group | Phase 4 |
| `Note` · `Resource` | Unified models with `parentType: AREA\|PROJECT\|TASK\|SYSTEM\|VISION` | Phase 2 (schema) + 5 (UI) |
| Resource — Free | **Link-only (no file uploads)**, max 10 resources total | Phase 5 |
| Resource — Pro | Links + file uploads via **Vercel Blob** (25MB per file, 2GB total, 200 resources) | Phase 5 |
| `Drift` | New Prisma model, `INBOX/PROCESSED/ARCHIVED` lifecycle | Phase 2 (schema) + 5 (UI) |
| `DailyState` | New Prisma model — collapses today's mood/energy/reflection/prompt/anti-goal-held | Phase 2 (schema) + 6 (UI) |
| `/anti-goals` page | Removed — anti-goals embed everywhere relevant (no dedicated page) | Phase 5 |
| `/rhythm/daily` page | Subsumed by TodayCard + `/systems` | Phase 4 |
| `/plan/[year]` & `/plan/new` | Subsumed by the new onboarding wizard. The per-year theme/intentions still persist as `YearlyPlan.reflections` JSON. Vision is its own life-spanning surface at `/vision`. | Phase 7 |
| Old URL redirects (301) | Maintained for `/goals*`, `/anti-goals`, `/plan/*` through Phase 7 | All phases |

---

## 2. System architecture

### 2.1 Stack
- **Frontend:** Next.js 16 App Router · React 19 · TypeScript (strict) · Tailwind CSS · shadcn/ui · framer-motion · recharts
- **Backend:** Next.js Route Handlers · Prisma ORM
- **Database:** PostgreSQL (Neon / Vercel Postgres)
- **Auth:** NextAuth.js
- **Storage:** Vercel Blob *(added Phase 5)*
- **Billing:** Lemon Squeezy
- **Hosting:** Vercel

### 2.2 Data flow

```
Browser
  │
  ├─ RSC fetch ──► Page (server component)
  │                    │
  │                    └─ lib/queries/*.ts ──► Prisma ──► Postgres
  │
  └─ Client interactions ──► /api/* route ──► Prisma ──► Postgres
                                  │
                                  └─ Vercel Blob (file uploads only)
```

### 2.3 Page contract

Every authenticated page is a **server component** that:
1. Calls `requireAuth()` for the session.
2. Calls **exactly one** `lib/queries/<surface>.ts` helper for all its data.
3. Renders `<PageContainer>` → `<PageHeader>` → sections.
4. Passes plan/role-relevant flags as props to client subtrees.
5. Never accesses `prisma` directly (only through query helpers).
6. Never re-fetches on the client (state mutations refresh server data via `router.refresh()`).

### 2.4 Gating contract

| Layer | Mechanism |
|---|---|
| Page-level | `<ProGate planTier role feature="…">` — server component; renders `<ProUpsellCard>` fallback |
| Inline cap nudges | `<ProUpsellCard>` shown when a Free user is at cap (don't block creation) |
| Feature flags | `lib/feature-flags.ts` — one function per feature (e.g. `canSeeFullWrapped`) |
| Limits | `lib/config.ts` `planLimits` — single source of truth |
| API enforcement | Each route reads session → checks limit → 403 with structured error if over |

---

## 3. Database design

### 3.1 Final entity graph (post Phase 2)

```
User
 ├─ Vision (1:1, life-spanning) ── VisionItem[]  ◄── NEW (NOT tied to a year)
 ├─ Area ──── Project (via areaId)               ◄── NEW
 ├─ YearlyPlan ──┬─ WheelOfLifeEntry
 │               ├─ Project (was Goal) ──┬─ Task (was Action)
 │               │                       ├─ System (was DailySystem) ── SystemCompletion
 │               │                       ├─ KeyResult
 │               │                       ├─ ProjectCheckpoint (was CheckpointGoal)
 │               │                       ├─ Motivation
 │               │                       └─ ProjectCheckIn (was GoalCheckIn)
 │               ├─ AntiGoal
 │               ├─ WeeklyPlan / WeeklyCheckIn
 │               ├─ MonthlyReview
 │               └─ QuarterlyReview
 ├─ Note (polymorphic parent)             ◄── NEW (migrates from GoalNote)
 ├─ Resource (polymorphic parent)         ◄── NEW
 ├─ Drift                                 ◄── NEW
 ├─ DailyState (1 per date)               ◄── NEW
 ├─ Streak
 ├─ Achievement
 └─ Subscription
```

> **Why Vision sits beside YearlyPlan, not inside it:** Vision is the user's
> *life vision board* — a north-star that outlives any individual year. A
> 2026 YearlyPlan can reference it but doesn't own it. Yearly "theme" copy
> still lives on `YearlyPlan.reflections.theme` for the per-year sentiment.

### 3.2 New / renamed Prisma models

```prisma
// ---- Renames (Phase 2) — only the model name changes; tables stay via @@map ----

model Project {
  // ...all existing Goal fields...
  areaId       String?   // NEW (Phase 2 schema, back-filled by migration)
  area         Area?     @relation(fields: [areaId], references: [id], onDelete: SetNull)
  @@map("goals")        // DB table unchanged
}

model Task        { @@map("actions") }            // was Action
model System      { @@map("daily_systems") }      // was DailySystem
model ProjectCheckIn      { @@map("goal_check_ins") }   // was GoalCheckIn
model ProjectCheckpoint   { @@map("checkpoint_goals") } // was CheckpointGoal

// ---- New entities (Phase 2 schema) ----

model Area {
  id         String   @id @default(cuid())
  userId     String
  name       String
  category   LifeCategory  // color/icon hint
  isDefault  Boolean  @default(false)
  sortOrder  Int      @default(0)
  archivedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  projects   Project[]
  @@index([userId, sortOrder])
  @@map("areas")
}

// Life-spanning vision board. One per user. Not tied to YearlyPlan.
model Vision {
  id        String   @id @default(cuid())
  userId    String   @unique
  // The north-star prose statement ("Who am I becoming?")
  northStar String?  @db.Text
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     VisionItem[]
  @@map("visions")
}

// Individual "cards" on the life vision board — statement, value, milestone, image, quote.
model VisionItem {
  id         String          @id @default(cuid())
  visionId   String
  areaId     String?         // optional anchor to a life Area
  kind       VisionItemKind
  title      String
  body       String?         @db.Text
  imageUrl   String?         // for IMAGE kind (URL only — no upload for v1)
  order      Int             @default(0)
  achievedAt DateTime?       // milestone celebration timestamp
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
  vision     Vision  @relation(fields: [visionId], references: [id], onDelete: Cascade)
  area       Area?   @relation(fields: [areaId], references: [id], onDelete: SetNull)
  @@index([visionId, order])
  @@map("vision_items")
}

model Note {
  id         String     @id @default(cuid())
  userId     String
  parentType ParentType
  parentId   String
  body       String     @db.Text
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([parentType, parentId])
  @@index([userId, updatedAt])
  @@map("notes")
}

// Links (all tiers) or file attachments (Pro only).
model Resource {
  id         String       @id @default(cuid())
  userId     String
  parentType ParentType
  parentId   String
  kind       ResourceKind        // LINK (all tiers) | FILE (Pro only)
  title      String
  url        String              // external URL for LINK; Blob URL for FILE
  mimeType   String?             // populated for FILE
  sizeBytes  Int?                // populated for FILE — used for storage quota math
  createdAt  DateTime     @default(now())
  user       User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([parentType, parentId])
  @@index([userId, kind])
  @@map("resources")
}

model Drift {
  id          String       @id @default(cuid())
  userId      String
  body        String       @db.Text
  status      DriftStatus  @default(INBOX)
  capturedAt  DateTime     @default(now())
  processedAt DateTime?
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, status, capturedAt])
  @@map("drifts")
}

model DailyState {
  id             String   @id @default(cuid())
  userId         String
  date           DateTime @db.Date
  mood           Int?     // 1–5
  energy         Int?     // 1–5
  reflection     String?  @db.Text
  promptKey      String?
  antiGoalHeldId String?
  antiGoalHeld   Boolean?
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  antiGoal       AntiGoal? @relation(fields: [antiGoalHeldId], references: [id], onDelete: SetNull)
  @@unique([userId, date])
  @@map("daily_states")
}

enum ParentType     { AREA  PROJECT  TASK  SYSTEM  VISION }
enum ResourceKind   { LINK  FILE }
enum DriftStatus    { INBOX  PROCESSED  ARCHIVED }
enum VisionItemKind { STATEMENT  VALUE  MILESTONE  IMAGE  QUOTE }
```

### 3.3 Migration strategy

1. **Phase 2 produces one Prisma migration** named `20260514_para_foundation` containing:
   - All new tables (`areas`, `visions`, `vision_items`, `notes`, `resources`, `drifts`, `daily_states`)
   - All new enums (`ParentType`, `ResourceKind`, `DriftStatus`, `VisionItemKind`)
   - Nullable `areaId` column on `goals` table
   - Data step: seed 6 default Areas per existing user (HEALTH, CAREER, FINANCE, RELATIONSHIPS, SPIRITUALITY, PASSION) and back-fill `goals.areaId` from `goals.category`
   - Data step: seed 1 empty `Vision` row per existing user (`northStar = null`, no items) so the Vision page never 404s
   - Data step: COPY all `goal_notes` rows into `notes` with `parentType='PROJECT'`, `parentId=goalId` (keeps `goal_notes` table intact for rollback safety)

2. **Phase 7 (cleanup) produces a second migration** named `20260528_cleanup` containing:
   - DROP `goal_notes` table (data already in `notes`)
   - Drop old `/api/goals/*` redirect routes
   - Optional: drop `goals.category` if Area-based filtering fully replaces it (else keep for legacy/hint)

3. **No destructive Prisma changes outside these two migrations.**

### 3.4 `planLimits` additions (Phase 2)

```ts
FREE: {
  // existing (preserved verbatim for back-compat with old code paths)
  maxPlans: 1,
  maxAntiGoalsPerPlan: 3,
  quarterlyReview: false,
  advancedAnalytics: false,
  aiCoach: false,
  streakShields: 0,
  accountability: false,

  // PARA rename — replaces maxGoalsPerPlan / maxDailySystemsPerGoal
  maxProjects: 3,                                    // was maxGoalsPerPlan
  maxTasksPerProject: 10,                            // NEW
  maxSystemsPerProject: 3,                           // was maxDailySystemsPerGoal

  // Areas
  maxAreas: 6,                                       // 6 defaults seeded
  maxCustomAreas: 0,                                 // Free can't add custom

  // Vision (life-board)
  maxVisionItems: 5,                                 // NEW — 5 cards on the board

  // Notes
  maxNotes: 20,                                      // NEW — across all entities

  // Resources (link-only on Free; no uploads, no storage cost to us)
  maxResources: 10,                                  // NEW — link rows only
  canUploadResourceFiles: false,                     // NEW — no Vercel Blob writes
  maxResourceFileBytes: 0,
  maxResourceStorageBytes: 0,

  // Wrapped
  fullWrapped: false,
},
PRO: {
  maxPlans: 5,
  maxAntiGoalsPerPlan: 50,
  quarterlyReview: true,
  advancedAnalytics: true,
  aiCoach: true,
  streakShields: 2,
  accountability: true,

  maxProjects: 20,
  maxTasksPerProject: 200,                           // generous, defensive cap
  maxSystemsPerProject: 10,

  maxAreas: 50,
  maxCustomAreas: 44,                                // 50 - 6 defaults

  maxVisionItems: 50,                                // NEW

  maxNotes: 5000,                                    // NEW — effectively unlimited

  maxResources: 200,                                 // NEW
  canUploadResourceFiles: true,                      // NEW — Vercel Blob enabled
  maxResourceFileBytes: 25 * 1024 * 1024,            // 25 MB per file
  maxResourceStorageBytes: 2 * 1024 * 1024 * 1024,   // 2 GB total

  fullWrapped: true,
},
```

> **Free → Pro upgrade nudges** for resources fire in two places:
> 1. Free user clicks "Upload file" on `<ResourcesBlock>` → `<ProUpsellCard>` inline ("Upload PDFs, images, and docs with Pro").
> 2. Free user adds the 11th link → cap nudge ("You're at 10/10 resources. Upgrade for 200.").

---

## 4. Final folder structure (after Phase 7)

```
src/
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx
│   │   ├── wheel/page.tsx              ◄── NEW
│   │   ├── vision/page.tsx             ◄── NEW
│   │   ├── areas/page.tsx              ◄── NEW
│   │   │   └── [areaId]/page.tsx
│   │   ├── projects/page.tsx           ◄── RENAMED from goals/
│   │   │   └── [projectId]/page.tsx
│   │   ├── tasks/page.tsx              ◄── NEW
│   │   ├── systems/page.tsx            ◄── NEW
│   │   ├── rhythm/
│   │   │   ├── page.tsx
│   │   │   ├── weekly/page.tsx
│   │   │   ├── monthly/page.tsx
│   │   │   └── quarterly/page.tsx       (no daily/ — subsumed)
│   │   ├── analytics/page.tsx
│   │   ├── wrapped/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── recap/[period]/page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── page.tsx, how-it-works/, about/, faq/, pricing/, blog/, terms/, privacy/, refund/, cookies/
│   │   └── layout.tsx
│   ├── api/
│   │   ├── projects/                   ◄── renamed from goals/
│   │   ├── tasks/                      ◄── NEW (and from existing actions/)
│   │   ├── systems/                    (existing; routes renamed inside)
│   │   ├── areas/                      ◄── NEW
│   │   ├── vision/                     ◄── NEW
│   │   ├── notes/                      ◄── NEW (replaces goal-notes/)
│   │   ├── resources/                  ◄── NEW
│   │   │   └── upload-url/             ◄── presigned Vercel Blob URL
│   │   ├── drifts/                     ◄── NEW
│   │   ├── anti-goals/                 (existing; embedded UI only)
│   │   ├── today/                      ◄── NEW (DailyState upsert)
│   │   ├── wheel/                      (existing? add if missing)
│   │   ├── plans/, weekly-checkin/, monthly-review/, quarterly-review/   (existing)
│   │   ├── achievements/, streaks/, recap/, wrapped/   (existing)
│   │   ├── auth/, billing/, account/, admin/
│   │   └── ... (other infra: cron, email, contact, dev/seed)
│   ├── onboarding/page.tsx
│   ├── login/, signup/, error/, account-disabled/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                             (shadcn primitives — read-only)
│   ├── atmosphere/
│   │   ├── eyebrow.tsx
│   │   ├── pro-mark.tsx
│   │   ├── soft-backdrop.tsx
│   │   └── ornament-divider.tsx
│   ├── shared/
│   │   ├── page-container.tsx
│   │   ├── page-header.tsx
│   │   ├── section-header.tsx
│   │   ├── empty-state.tsx
│   │   ├── skeleton-card.tsx
│   │   ├── app-content.tsx
│   │   ├── app-sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── quick-capture-button.tsx    (evolves to write Drifts in Phase 5)
│   │   ├── mobile-nav.tsx
│   │   ├── marketing-mobile-nav.tsx
│   │   ├── login-form.tsx
│   │   └── (legacy: mandala-watermark, premium-gate → deleted in Phase 7)
│   ├── upgrade/
│   │   ├── pro-gate.tsx
│   │   └── pro-upsell-card.tsx
│   ├── dashboard/                      (/dashboard only)
│   ├── wheel/                          ◄── NEW
│   ├── vision/                         ◄── NEW
│   ├── areas/                          ◄── NEW
│   ├── projects/                       ◄── RENAMED from goals/
│   ├── tasks/                          ◄── NEW
│   ├── systems/                        (exists; expanded in Phase 4)
│   ├── today/                          ◄── NEW (TodayCard moves here from dashboard/)
│   ├── notes/                          ◄── NEW (NotesBlock + editor)
│   ├── resources/                      ◄── NEW (ResourcesBlock + upload UI)
│   ├── drifts/                         ◄── NEW (InboxBlock, ProcessDialog)
│   ├── anti-goals/                     (existing; used as embedded UI)
│   ├── check-in/                       (existing weekly/monthly/quarterly forms)
│   ├── rhythm/, recap/, analytics/, wrapped/, settings/
│   ├── onboarding/                     (existing; refactored in Phase 7)
│   ├── wisdom/, marketing/             (existing)
│   └── (DELETE: goals/, welcome-dashboard.tsx, icebreaker-upsell.tsx, wheel-icebreaker.tsx)
│
├── lib/
│   ├── auth.ts, auth-guard.ts, db.ts, email.ts
│   ├── config.ts                       (planLimits — extended Phase 2)
│   ├── plan-access.ts
│   ├── feature-flags.ts                (extended per phase)
│   ├── motion.ts
│   ├── charts-theme.ts
│   ├── storage.ts                      ◄── NEW Phase 5 (Vercel Blob)
│   ├── today-prompts.ts                ◄── NEW Phase 6 (seasonal prompt library)
│   ├── utils.ts
│   ├── nav-config.ts                   (extended per phase)
│   ├── rate-limit-auth.ts
│   ├── sanitize.ts, sanitize-client.ts
│   ├── systems-period.ts
│   ├── legal.ts, wisdom.ts
│   ├── constants/
│   │   ├── categories.ts (LifeCategory)
│   │   ├── achievements.ts
│   │   └── status.ts
│   └── queries/
│       ├── dashboard.ts
│       ├── projects.ts                 ◄── renamed from goals.ts
│       ├── tasks.ts                    ◄── NEW
│       ├── systems.ts                  (existing; extended Phase 4)
│       ├── areas.ts                    ◄── NEW
│       ├── vision.ts                   ◄── NEW
│       ├── notes.ts                    ◄── NEW
│       ├── resources.ts                ◄── NEW
│       ├── drifts.ts                   ◄── NEW
│       ├── today.ts                    ◄── NEW (DailyState)
│       ├── rhythm/{weekly,monthly,quarterly}.ts
│       ├── analytics.ts, wrapped.ts, recap.ts
│       └── plans.ts, check-in.ts, quarterly.ts, weekly-workspace.ts, admin.ts
└── middleware.ts
```

---

## 5. Modularity & reusability contract

### 5.1 Three layers
1. **Primitives** (`components/atmosphere`, `components/shared`, `components/upgrade`, `components/ui`) — domain-agnostic, used everywhere.
2. **Feature modules** (`components/<surface>/`) — domain-specific. One folder per top-level surface. Only imports from primitives and other feature modules **explicitly**.
3. **Pages** (`app/(app)/<surface>/page.tsx`) — orchestration only. Server-side fetch + composition. No business logic.

### 5.2 What may be reused across feature modules
- ✅ Primitives (`<PageContainer>`, `<PageHeader>`, `<Eyebrow>`, etc.)
- ✅ `<NotesBlock>` and `<ResourcesBlock>` — accept `parentType` + `parentId`, work everywhere
- ✅ `<AntiGoalsList>` — accept a `mode` prop for context (Vision-edit, Project-display, Review-check, Today-pill)
- ✅ Lib query helpers — server-only, called from pages
- ❌ A page's own client components — keep scoped to its feature folder

### 5.3 Naming conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`, named export (never default for components; defaults only for pages)
- Hooks: `useThing`
- Queries: `getThing()` / `listThing()` / `upsertThing()`
- Routes: `POST/GET/PATCH/DELETE` handlers in `route.ts`

### 5.4 TypeScript discipline
- `strict: true`, `noUncheckedIndexedAccess: true`
- No `any` outside well-defined boundaries (e.g., recharts data shapes get narrowed locally)
- Exported functions have explicit return types
- Prisma models drive types — don't redefine the same shape

---

## 6. Development standards

### 6.1 Git workflow
- **Branch per phase:** `phase-2-schema-foundation`, `phase-3-foundation-surfaces`, …
- **One PR per phase**, squash-merged to `main`
- **Conventional commits**: `feat(areas): add areas list page`, `refactor(rename): goal → project`, `chore(deps): bump …`, `fix(today): timezone bug`

### 6.2 Per-phase checklist (gating to merge)
- [ ] `next build` exits 0 with no new warnings
- [ ] `npm run lint` (if configured) clean
- [ ] `npx prisma migrate status` clean
- [ ] Manual smoke test: every touched route loads, every touched flow completes
- [ ] `PROGRESS.md` updated with phase log
- [ ] No env var changes (or explicitly documented and approved)
- [ ] No middleware changes (or explicitly documented and approved)

### 6.3 Code review heuristics
- Reviewer reads `PROGRESS.md` phase log first
- Diff smaller than 2500 lines net or it gets split
- Any new component imports only from: `@/components/{ui,atmosphere,shared,upgrade}` or its own feature folder
- Any new page does exactly: requireAuth → lib/query → render

### 6.4 Database migration discipline
- Migrations named `YYYYMMDD_purpose`
- Each phase adds **at most one** migration file (or zero)
- Data steps live in the migration SQL (not in app code) so rollback is honest
- `@@map`/`@map` used for any TypeScript rename that mustn't move data

### 6.5 What does NOT change during this rollout
- `.env.local` / `.env.production` (the storage token gets added explicitly in Phase 5)
- `src/middleware.ts` (the public routes list — additions only if new public pages appear)
- Auth flow / NextAuth config
- Lemon Squeezy billing integration

---

## 7. Phase plan (6 phases · ~2 weeks)

### ✅ Phase 0 — Foundation primitives (done · 2026-05-12)
Shared primitives, conventions, gating helpers. No UI change.

### ✅ Phase 1 — Dashboard Home (done · 2026-05-12)
TodayCard, restyled stats/wheel/projects/quick-actions/achievements. Single query round-trip.

---

### Phase 2 — Schema + Naming foundation (1 day)

**No UI redesign. Just the schema and the rename.** Everything subsequent depends on this.

**Prisma**
- Rename models via `@@map`: `Goal→Project`, `Action→Task`, `DailySystem→System`, `GoalCheckIn→ProjectCheckIn`, `CheckpointGoal→ProjectCheckpoint`
- Rename relation field `goalId` → `projectId` where natural; preserve column name via `@map("goalId")`
- Add new models: `Area`, `Vision`, `Note`, `Resource`, `Drift`, `DailyState`
- Add enums: `ParentType`, `ResourceKind`, `DriftStatus`
- Add nullable `Project.areaId` (FK to `Area`)
- One migration: `20260514_para_foundation` includes table creation + data seed step

**Data migration step (in migration SQL)**
- For every existing user, insert 6 default Areas (one per LifeCategory, `isDefault=true`)
- For every existing `goals` row, `UPDATE goals SET areaId = (matching default area for that user with category=goals.category)`
- `INSERT INTO notes SELECT id, goal.userId, 'PROJECT', goalId, content, createdAt, createdAt FROM goal_notes` (copy, don't drop)

**Code rename sweep**
- Move `src/components/goals/` → `src/components/projects/`
- Rename component filenames (`goal-card.tsx` → `project-card.tsx`, etc.)
- Move `src/app/(app)/goals/` → `src/app/(app)/projects/` and `[goalId]` → `[projectId]`
- Move `src/app/api/goals/` → `src/app/api/projects/`
- Move `src/lib/queries/goals.ts` → `projects.ts`
- Global find-replace identifiers: `Goal`→`Project`, `goal`→`project`, `goals`→`projects` (preview each match)

**URL redirects** (`next.config.ts`)
- `/goals` → `/projects` (301)
- `/goals/:id` → `/projects/:id` (301)
- `/api/goals/*` → `/api/projects/*` (301)
- `/anti-goals` → `/vision` (301)
- `/rhythm/daily` → `/systems` (301)
- `/plan/new` → `/onboarding` (301)
- `/plan/[year]` → `/dashboard` (301) *(per-year theme is no longer a standalone page; lives in onboarding + dashboard)*

**Marketing copy update**
- Homepage Hero, Problem, Plan, FeaturesTeaser, Contrast, PricingTeaser, CtaBand
- `/how-it-works`, `/pricing`, `/faq`, `/about`
- `pricing-compare.tsx` rows ("Active goals" → "Active projects")

**Config**
- `planLimits` updated:
  - Renames: `maxGoalsPerPlan` → `maxProjects`, `maxDailySystemsPerGoal` → `maxSystemsPerProject`
  - New keys: `maxTasksPerProject`, `maxAreas`, `maxCustomAreas`, `maxVisionItems`, `maxNotes`, `maxResources`, `canUploadResourceFiles`, `maxResourceFileBytes`, `maxResourceStorageBytes`, `fullWrapped`
  - Old keys (`maxGoalsPerPlan`, `maxDailySystemsPerGoal`) kept as aliases for one phase, marked `@deprecated`, removed in Phase 7.

**Acceptance**
- `next build` clean, no new TypeScript errors
- `npx prisma migrate status` clean — one migration applied
- Every old URL returns 301 to the new path
- All existing data accessible — no row counts changed except seeded Areas
- `goal_notes` table still exists; new `notes` table has the same row count

---

### Phase 3 — Foundation surfaces (1–2 days)

`/wheel`, `/vision`, `/areas` + `/areas/[id]`.

**Frontend**
- `/wheel/page.tsx` — full Wheel of Life surface (large radar, per-category scoring grid, edit-in-place). Reuses existing `WheelChart` and adds a structured editor.
- `/vision/page.tsx` — **Life Vision Board** (not yearly): single-page surface with the user's north-star statement at the top and a grid of `VisionItem` cards below. Each card has a `kind` chip (Statement / Value / Milestone / Image / Quote), title, optional body or image, optional Area anchor. Cards are reorderable (drag handle), tap-to-edit. Empty state surfaces 5 starter prompts ("What kind of person are you becoming?", "What are your core values?", "What's one milestone that would mean everything?", …). Free user at 5 items → inline `<ProUpsellCard>`.
- `/areas/page.tsx` — 3-column grid of Areas, matches YIR's `Areas.tsx` 1:1. Card shows: icon, name, project count, on-track count, top 3 projects with progress %, notes count. "New area" button (Pro-only with `<ProUpsellCard>` for Free).
- `/areas/[areaId]/page.tsx` — area detail (big icon + name, projects grid filtered to this area, `<NotesBlock parentType="AREA">` placeholder, `<ResourcesBlock>` placeholder — Phase 5 fills these in).
- Sidebar updated: `nav-config.ts` adds `Foundation` group with Wheel / Vision / Areas. Topbar breadcrumbs handle new routes.

**Backend**
- `lib/queries/areas.ts` (list, byId, projectsByArea, counts)
- `lib/queries/vision.ts` (`getByUser`, `upsertNorthStar`, `listItems`, `reorderItems`)
- `lib/queries/wheel.ts` (latest scores, history)
- API: `/api/areas` (GET/POST), `/api/areas/[id]` (PATCH/DELETE), `/api/vision` (GET/PATCH north-star), `/api/vision/items` (POST), `/api/vision/items/[id]` (PATCH/DELETE), `/api/vision/items/reorder` (POST)

**Acceptance**
- 6 default areas visible to every existing user immediately
- Existing Projects show their area badge linking to area detail
- Free user creating 7th area → `<ProUpsellCard>` blocks
- Pro user can create, edit, archive custom areas
- Vision north-star edits autosave (debounced PATCH)
- Vision items: create / edit / reorder / archive all work end-to-end
- Free user at 5 items → blocked from creating 6th with `<ProUpsellCard>` nudge

---

### Phase 4 — Planning surfaces (1–2 days)

Projects (visual redesign), Tasks (new), Systems (new top-level).

**Frontend**
- `/projects/page.tsx` — editorial card grid with area badge, category dot, progress, status chip. Empty state. Cap pill (Free: 3/3) with inline `<ProUpsellCard>`.
- `/projects/[projectId]/page.tsx` — Motivation block, **Tasks section** (combines Tasks + KeyResults + Checkpoints into one tabbed/typed list), Notes placeholder, Resources placeholder, Check-ins history. Sticky right rail with status + quick actions.
- `/tasks/page.tsx` — flat list of all Tasks across all projects with filters: project, area, status, due. Group views: "Today", "This Week", "Backlog", "Done". Quick-add inline.
- `/systems/page.tsx` — management list of all Systems with frequency, current streak, completion % (7-day), action menu (edit, archive). Filter by project/area. Quick-add inline.

**Backend**
- `lib/queries/projects.ts` (already exists post-Phase 2 — extend with detail fetcher)
- `lib/queries/tasks.ts` — list/filter, byProject, today/week/backlog views
- `lib/queries/systems.ts` (exists — extend with management view)
- API: `/api/tasks` (CRUD), `/api/systems` (CRUD already exists; extend)

**Acceptance**
- Every existing project's tasks/key-results/checkpoints visible under unified Tasks section
- `/tasks` shows everything with working filters
- `/systems` lets you create, edit, archive recurring systems
- Free cap enforced UI + API on projects and systems

---

### Phase 5 — Cross-cutting surfaces (1–2 days)

Notes, Resources (with Vercel Blob uploads), Anti-Goals embedded, Drifts via Quick Capture.

**Frontend**
- `<NotesBlock parentType parentId>` — list, inline add, edit, delete. Markdown rendering. Mounted on Area detail, Project detail, Task detail (modal), System detail (modal), Vision page.
- `<ResourcesBlock parentType parentId>` — list of resources, "Add link" inline form (all tiers), "Upload file" button (Pro only — Free sees calm `<ProUpsellCard>` instead of button). File uploads go via presigned URL → direct upload to Vercel Blob. Per-resource preview (favicon for links, type icon for files).
- `<AntiGoalsList mode>` — modes: `vision-edit` (CRUD), `project-display` (read-only), `review-check` (per-week pills), `today-pill` (single rotating).
  - Mounted on Vision page (full CRUD)
  - Mounted on Project detail (display)
  - Mounted on Weekly review form (check pills)
  - Mounted on Monthly review (aggregate display)
  - Mounted on TodayCard (single pill — wires to DailyState in Phase 6)
- Quick Capture pill (`⌘K`) evolves: writes a `Drift` row instead of localStorage.
- Drift Inbox affordance on Dashboard: "3 drifts to organize" → opens panel with each drift + "Process" dialog (convert to Note, Task, Project, or Archive).

**Backend**
- `lib/queries/notes.ts`, `lib/queries/resources.ts`, `lib/queries/drifts.ts`
- `lib/storage.ts` — Vercel Blob helpers (`generatePresignedUploadUrl`, `deleteFile`, quota tracking)
- API: `/api/notes` (CRUD), `/api/resources` (CRUD), `/api/resources/upload-url` (POST presigned), `/api/drifts` (CRUD + `/process`)
- ENV: add `BLOB_READ_WRITE_TOKEN` to `.env.local` and document in deployment guide

**Acceptance**
- Existing `goal_notes` data visible as Notes on Project detail (zero-loss migration confirmed in Phase 2)
- Can attach a Note to an Area, Project, Task, System, or Vision
- Can attach a link Resource (all tiers)
- Pro user can upload a file (PDF, image, docx); file lives in Vercel Blob; can re-download
- Free user clicks "Upload file" → calm `<ProUpsellCard>` (no Blob write attempted; protects cost)
- Pro at storage cap (2GB) or per-file cap (25MB) → blocked with explicit error
- Quick Capture (`⌘K`) saves Drifts; Dashboard shows Inbox count; Process dialog routes a drift into the right destination

---

### Phase 6 — Rhythm + Today depth (1–2 days)

Today depth (DailyState), Weekly / Monthly / Quarterly review redesigns.

**Frontend**
- TodayCard (shipped Phase 1) extended with:
  - Today's prompt (`lib/today-prompts.ts`, deterministic by day-of-year)
  - Reflection textarea (debounced autosave to `DailyState`)
  - Mood + Energy 1–5 pills
  - "Held the line?" pill on one rotating anti-goal
- `/rhythm/page.tsx` — landing card pointing into Weekly/Monthly/Quarterly
- `/rhythm/weekly` — five-minute check-in form + last-week recap link. Anti-goals check pills inline.
- `/rhythm/monthly` — wins/challenges/adjustments form + recap link. Anti-goals aggregate.
- `/rhythm/quarterly` — Pro-gated via `<ProGate>`. Full review form + previous quarter recap.

**Backend**
- `lib/queries/today.ts` — getByDate, upsert DailyState
- `lib/today-prompts.ts` — seeded prompt library (60+ prompts, day-of-year selector)
- Migrate `lib/queries/rhythm/{weekly,monthly,quarterly}.ts` to use renamed `ProjectCheckIn` model
- API: `/api/today` (GET, PATCH — upsert by date)

**Acceptance**
- TodayCard reflection autosaves to DailyState
- Mood/energy persist across reloads
- Anti-goal check persists per day
- Daily mood feeds analytics without conflicting with weekly mood
- Free user on `/rhythm/quarterly` sees `<ProUpsellCard>`

---

### Phase 7 — Insights + Settings + Cleanup (1–2 days)

Analytics, Wrapped, Settings, onboarding rebuild, cleanup.

**Frontend**
- `/analytics` — Pro-gated. Charts use `chartColors`. Editorial section headers. Empty state if < 4 weeks of data. Now visualises daily mood/energy from `DailyState`.
- `/wrapped` — Pro: 10-slide cinematic driven by real data. Free: `<WrappedSummaryCard>` (static one-screen). Slides use `<SlideStage>`/`<Eyebrow>`/`<Display>`/`<Body>` primitives.
- `/settings` — editorial sections (Profile · Timezone · Notifications · Plan · Danger zone). Plan section with current tier badge, billing portal link, upgrade CTA if Free.
- `/onboarding` — rebuilt as the Foundation+Planning wizard (Wheel → Areas → 1 starter Project → 1 starter System → optional yearly theme). Vision is **not** part of onboarding (life vision is too weighty for a first-run wizard — users discover `/vision` from the sidebar and fill it gradually).

**Backend**
- Migrate `lib/queries/{analytics,wrapped}.ts` to use renamed models
- Migrate Wrapped slides to derive from real data
- Onboarding API: single `POST /api/onboarding` does all writes atomically

**Cleanup migration `20260528_cleanup`**
- DROP `goal_notes` table (data already in `notes`)
- DROP unused fields if any
- Remove dead components: `welcome-dashboard.tsx`, `wheel-icebreaker.tsx`, `icebreaker-upsell.tsx`, `mandala-watermark.tsx` (audit usage), `premium-gate.tsx` after migrating last 3 callsites to `ProGate`
- Remove old API routes that have been redirecting: `/api/goals/*` (clients should be on new endpoints)
- Remove `/rhythm/daily` route (redirect to `/systems` already in place)
- Remove `/plan/new` route (redirect to `/onboarding`)
- Remove `/plan/[year]` route (redirect to `/vision`)
- Drop `(app)/plan/` directory

**Final QA pass**
- Skeleton loaders consistent across all surfaces
- Error boundaries on every page
- Mobile QA every page (sidebar collapse, breadcrumb truncation)
- Print styles on Recap and Wrapped
- Accessibility pass (focus rings, aria-labels, keyboard nav)
- Lighthouse on `/dashboard`, `/projects`, `/areas` (≥ 90 perf, ≥ 95 a11y)
- Final `next build` + manual smoke test of every flow

**Acceptance**
- All five surface groups (Dashboard / Foundation / Planning / Rhythm / Insights / Account) feel cohesive
- Old URLs all return 301 to correct destinations
- Production data fully accessible, no orphans
- `prisma migrate status` clean with both `para_foundation` and `cleanup` migrations applied

---

### Future workstreams (after Phase 7 ship)

- **Echo AI Companion** — separate, ~3–5 phases
- **Drift block editor** (`/`-commands) — after Echo
- **File preview in browser** for Resources (PDF/image inline viewer)
- **Note backlinks** (auto-link `[[Project name]]` references)

---

## 8. Risk register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Phase 2 rename breaks production due to a stale `Goal` reference | Medium | Use TypeScript compiler as the safety net — every `Goal` reference becomes a compile error post-rename. `next build` gate. Staging deploy + manual smoke test before merging. |
| Notes data lost during `goal_notes` → `notes` migration | Low | Migration is COPY (not MOVE). Old `goal_notes` table kept until Phase 7. Row-count verification step in migration SQL. |
| Old bookmarked URLs return 404 | Low | 301 redirects in `next.config.ts` for every old path. Kept indefinitely. |
| File upload abuse (oversized, wrong type, scripts) | Medium | Server-side mime allowlist, size limit before presigned URL issued, per-user storage quota check, Pro-aware rate limit. |
| Vercel Blob token leaks | Low | Token is server-only env var. Client never sees it. Presigned URLs are short-lived. |
| Phase scope creep | High (this is the lesson from the last 2 weeks) | One PR per phase, hard line. New ideas go to "Future workstreams" or "Cross-phase parking lot" — never bolted onto an in-flight phase. |
| Forgotten YIR-only mock data ships | Medium | `.cursor/rules/dashboard.mdc` rule forbids importing from `app-mock.ts`, `today-mock.ts`, `spine-store.ts`, etc. Code review checks this. |

---

## 9. Out of scope (this rollout)

- Renaming `LifeCategory` enum
- Standalone `/tasks/[id]` URL (task detail = drawer/modal for now)
- Standalone Notes editor (Drift editor) — future
- Echo AI — future workstream
- File preview in browser — future
- Multi-language / i18n
- Team / collaboration features
- Mobile app

---

## 10. Pointer to other docs

- [`README.md`](./README.md) — entry point + hard rules
- [`PROGRESS.md`](./PROGRESS.md) — per-phase tracker (mutable)
- [`PARA.md`](./PARA.md) — NBB ↔ PARA entity mapping
- `.cursor/rules/dashboard.mdc` — code conventions enforced on every PR
