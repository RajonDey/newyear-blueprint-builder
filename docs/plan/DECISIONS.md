# Decisions Log

Record only consequential decisions that affect scope, quality, or architecture.

---

## 2026-03-30 - Create dedicated execution plan workspace

Status: Accepted

### Decision

Create `docs/plan/` as the source of truth for phased execution and progress tracking.

### Why

- Prevent context loss across sessions.
- Keep roadmap, active sprint, risks, and completion history connected.
- Enforce step-by-step delivery discipline.

### Impact

- Execution is tracked in-repo and versioned.
- `NEXT_SPRINT.md` becomes the active queue.

---

## 2026-03-30 - Phase 1 sequencing before feature expansion

Status: Accepted

### Decision

Complete correctness/safety tasks (ownership guard, sanitization, week/time consistency) before IA redesign and new features.

### Why

- Reduces security and data-integrity risk early.
- Prevents shipping new complexity on unstable foundations.

### Impact

- Navigation and pages/notes work are intentionally deferred to Phase 2/3.

---

## 2026-03-30 - Rich-text sanitization boundary

Status: Accepted

### Decision

Use a dual boundary for rich text:

- Sanitize on write in APIs before persisting HTML.
- Sanitize again on render before `dangerouslySetInnerHTML`.

### Why

- Protects new writes immediately.
- Reduces risk from legacy data already stored in DB.
- Keeps rendering safe even if future API paths miss sanitization.

### Impact

- Introduced shared utility `src/lib/sanitize.ts`.
- Applied sanitizer in weekly check-ins, goals, wizard submit, monthly, and quarterly APIs.
- Applied sanitizer at all current HTML render points.

---

## 2026-03-30 - IA simplification for Phase 2

Status: Accepted

### Decision

Move navigation toward a clearer hierarchy using sectioned IA:

- Plan
- Execute
- Review
- Account

### Why

- Existing mixed nav made "where to go next" unclear.
- Weekly/monthly/quarterly workflows were discoverable only if users knew the rhythm section.

### Impact

- Sidebar and mobile nav now use explicit sections.
- Monthly review is promoted to main navigation.
- Weekly wording shifted to "Weekly Planner" for clarity. All nav labels follow consistent `[Cadence] [Noun]` pattern: Daily Habits, Weekly Planner, Monthly Review, Quarterly Review.

---

## 2026-03-30 - Marketing claims must match shipped depth

Status: Accepted

### Decision

Remove or soften prominent marketing claims for features not yet clearly shipped as user-facing workflows.

### Why

- Reduces trust and expectation mismatch risk.
- Keeps conversion quality high by setting accurate expectations.

### Impact

- Pricing/features/home/settings copy updated to emphasize shipped Pro value:
  quarterly/monthly review depth, analytics, premium wrapped.

---

## 2026-05-14 - Adopt PARA (Areas → Projects → Tasks) as the dashboard model

Status: Accepted

### Decision

Replace NBB's flat Goals model with the PARA / Second-Brain hierarchy:

```
Area (life domain)
└─ Project (was Goal) — concrete endeavour
   └─ Task (was Action) — actionable unit
+ Notes & Resources (transversal)
+ Vision (life-spanning)
+ DailyState / Drift (daily layer)
```

### Why

- The YIR / Lovable redesign was structurally PARA all along.
- User confirmed they're building on Second-Brain principles, not aesthetic borrowing.
- Lets us collapse the ad-hoc `/anti-goals`, `/drifts`, `/notes`, `/resources`, `/links` surfaces into entity-embedded blocks.

### Impact

- Phase 2 renames `Goal` → `Project`, `Action` → `Task`, `DailySystem` → `System` at the code level. DB tables stay via Prisma `@@map` — zero data risk.
- New Prisma models: `Area`, `Vision`, `VisionItem`, `Note`, `Resource`, `Drift`, `DailyState`.
- Old URLs (`/goals*`, `/anti-goals`, `/plan/*`) 301-redirected.
- Active forward plan: [`docs/plan/MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) + [`docs/CHANGELOG.md`](../CHANGELOG.md).

---

## 2026-05-14 - Vision is life-spanning, not yearly

Status: Accepted

### Decision

The `Vision` entity is **owned by the User**, not by a `YearlyPlan`. Schema:
`Vision (1:1 User) + VisionItem[]`. Per-year theme/intentions remain on
`YearlyPlan.reflections` JSON.

### Why

A vision board aligns a person across many years on the road to who they're
becoming — not what they're doing in a single calendar year.

### Impact

- `/vision` is a single life surface, not year-scoped.
- Onboarding wizard does **not** include a Vision step (too weighty for first-run); users discover Vision from the sidebar after onboarding.
- VisionItem caps: Free 5 cards · Pro 50.

---

## 2026-05-14 - Resource file uploads are Pro-only

Status: Accepted

### Decision

- **Free:** `Resource.kind = LINK` only. Max 10 resources total. No Vercel Blob writes.
- **Pro:** LINK + FILE. Max 200 resources total. 25MB per file, 2GB total storage in Vercel Blob.

### Why

File storage has marginal cost; link storage is free. Letting Free users
write to Blob would create open-ended unit-economics exposure. Pro tier
unlocks the storage backend explicitly.

### Impact

- New `planLimits` keys: `maxResources`, `canUploadResourceFiles`, `maxResourceFileBytes`, `maxResourceStorageBytes`.
- `<ResourcesBlock>` shows "Upload file" as a Pro-only affordance with calm `<ProUpsellCard>` for Free users.
- `BLOB_READ_WRITE_TOKEN` env var added in Phase 5.

---

## 2026-05-14 - Split Prisma schema into `prisma/schema/` folder

Status: Accepted

### Decision

Use Prisma 6's multi-file schema support. Files numbered by domain:
`00-base.prisma` (datasource + enums) · `10-identity.prisma` · `20-foundation.prisma` ·
`30-projects.prisma` · `40-execution.prisma` · `50-rhythm.prisma` · `60-knowledge.prisma` ·
`70-system.prisma`.

### Why

- `schema.prisma` is already ~470 lines and Phase 2 adds 6+ models — single-file becomes hard to navigate.
- Per-domain files make PR diffs much clearer.
- Agents (and humans) can load one domain at a time.

### Impact

- `package.json` `prisma.schema` pointed at `./prisma/schema`.
- No behavioural change — Prisma compiles all files into one schema for migrations.
- First commit of Phase 2; the Goal → Project rename then happens cleanly inside `30-projects.prisma`.

---

## 2026-05-14 - Migration history rebaselined (Phase 2 ship)

Status: Accepted

### Decision

Truncate the `_prisma_migrations` history and replace it with a clean two-row baseline as part of the Phase 2 ship:

- `00000000000000_baseline/migration.sql` — full schema snapshot of the production DB as of 2026-05-14 (everything that existed before Phase 2, including the `users.disabledAt` column).
- `20260514000000_para_foundation/migration.sql` — adds PARA enums + tables (`Area`, `Vision`, `VisionItem`, `Note`, `Resource`, `Drift`, `DailyState`), the `goals.areaId` column + FK, and the data-seed tail (default areas, area back-fill, empty vision, legacy `goal_notes → notes` copy).

The previous lone migration (`20250320190000_add_user_disabled_at`) was deleted from disk and from the history table because it's now subsumed by the baseline snapshot.

### Why

- Phase 2 introduces the multi-file schema (`prisma/schema/`) plus 7 model renames via `@@map` and 7 new tables. Trying to extend the old history caused `P3006` shadow-DB errors (the prior migration referenced a `users` table that wasn't yet created in the shadow, because earlier work used `db push` rather than proper migrations).
- The product has **no real users yet** — explicitly confirmed by the founder before the rebase — so historical migration provenance has no operational value.
- Resetting to a clean `baseline + para_foundation` pair gives us a sound starting point for every future migration.

### Impact

- `prisma.config.ts` (new) points Prisma at `prisma/schema/` and replaces the deprecated `package.json#prisma` block.
- `prisma migrate status` reports two applied migrations; future schema changes go through `prisma migrate dev --create-only` against this clean history.
- Anyone with an existing local Postgres copy of `neondb` should re-run `prisma migrate deploy` to sync. New environments need no special handling.

---

## 2026-05-15 - Aggressive cleanup pass (no real users → can delete instead of deprecating)

Status: Accepted

### Decision

With the founder confirming **no real production users yet**, the rollout shifts from "additive only" to allowing destructive cleanup where it makes the code clearer:

- Drop the legacy `goal_notes` table outright (migration `20260515000000_drop_goal_notes`) — replaced by polymorphic `notes` in Phase 5.
- Delete the legacy wizard tree (components + Zustand store + `/api/plans/wizard` + validation schema) instead of carrying it as deprecated code.
- Delete `<WelcomeDashboard>`, `<IcebreakerUpsell>`, `<WheelIcebreaker>`, `<GoalNotes>` UI + APIs entirely (Phase 7).
- Convert `/plan/new` and `/plan/[year]` from full pages to 1-line `redirect()` calls.

### Why

- Carrying dead code makes the model harder to learn and the dependency surface larger.
- With zero users we can take the cleaner path with no migration story.
- Most "deprecation periods" exist to give consumers time to migrate; we have no consumers.

### Impact

- Phase 7 removed ~13 files.
- Phase 10 (repo hygiene) removed another 9 source files + 4 unused npm deps (`zustand`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`) + the `<QueryClientProvider>` wrapper.
- All redirects via `redirect()` keep inbound links alive — no 404s for bookmarked URLs.

---

## 2026-05-15 - Skip Echo AI for v1

Status: Accepted

### Decision

The AI coach surface ("Echo") from the YIR design study is **not** shipping in v1. No waitlist tease either. Revisit post-launch once we have real DAU + retention data to ground prompts in.

### Why

- LLM features need careful prompting that depends on understanding how users actually use the product. Building blind = building wrong.
- A waitlist tease without a follow-through erodes trust.
- The sidebar stays focused on the engine (PARA + reflection rituals) until the engine itself has traction.

### Impact

- Marketing copy says nothing about an AI coach.
- No `/echo` route. No "coming soon" placeholder.
- Phase 8 wrote a "Future — Echo AI Companion" row in `PROGRESS.md` so this decision is logged where the work is tracked.

---

## 2026-05-15 - Quick Capture is a hybrid (textarea + cmdk palette), not palette-only

Status: Accepted

### Decision

`⌘K` opens a **textarea** by default — the inbox-zero "type a thought, hit Enter, done" experience. Typing `/` as the first character (or `⌘⇧K`) switches to a **cmdk command palette** for jump-to and create actions. Both modes share the same Dialog state so closing the palette puts you back wherever the draft was.

### Why

- The YIR study shipped palette-only. NBB had shipped textarea-only. Pure swap to palette would have regressed the daily-driver capture flow.
- A hybrid lets us preserve the lightweight default while adding power-user palette navigation behind a single keystroke.
- The escape hatch (`/`) is the same keystroke users already know from Notion / Linear / Slack.

### Impact

- `src/components/shared/quick-capture-button.tsx` rewritten as a single component with two modes.
- New `/api/quick-capture/context` endpoint returning `{ areas, projects, recentDrifts }` for the palette (capped tightly to keep open snappy).
- `src/components/ui/command.tsx` ported from YIR with NBB's editorial spacing + a11y fixes (visually-hidden `DialogTitle` / `DialogDescription`).

---

## 2026-05-15 - Sidebar IA — 4 groups, account in topbar avatar

Status: Accepted

### Decision

Consolidate the sidebar from 6 groups (14 items) to 4 groups (11 items), organised by **user intent** not data type:

```
TODAY       Dashboard · Drift inbox
PLAN        Areas · Projects · Tasks · Systems
REFLECT     Weekly · Monthly · Quarterly · Analytics
FOUNDATION  Wheel of Life · Vision · Anti-goals · Year Wrapped
```

Account-level surfaces (Settings · Admin · Sign out) move to the **topbar avatar dropdown**, matching the Linear / Notion / Sunsama pattern.

Removed from the sidebar (still reachable, just not top-level):
- `/rhythm/daily` (Daily Habits) — same data as TodayCard + `/systems`, no value in triple-counting.
- `/settings`, `/admin` — account surfaces don't belong in the work nav.

### Why

- Six groups is a wall — users scan in <1 second; we need to win that second.
- "Systems / Anti-goals / Daily Habits" weren't sibling planning items; they were a redundant view + a year-level constraint + a daily-view of the same data. Grouping them as peers was a category error.
- "Account in avatar dropdown" is the strongest cross-app pattern in modern productivity tools.

### Impact

- `src/lib/nav-config.ts` rewritten — both `<AppSidebar>` and `<MobileNav>` absorb the change automatically (pure consumers).
- `src/components/shared/topbar.tsx` gained an Admin row (gated by `role === "ADMIN"`).
- All routes still alive — only their *placement in nav* changed.
- Quick Capture palette still indexes everything in its "Pages" group, so keyboard users have zero loss of reach.

---

## 2026-05-21 - Dual-surface IA & scope lock (product completeness PC-01)

Status: Accepted

### Decision

Keep **all 11 sidebar destinations** and cross-cutting features. Resolve the tension between the original PARA embed-only plan (May 14) and Phase 8–9 shipped IA by adopting an explicit **dual-surface pattern**:

- **Preview** — Dashboard cards, Today pills, embedded blocks (at-a-glance)
- **Workspace** — full pages (`/drifts`, `/anti-goals`, `/systems`, etc.)

Anti-goals and Drifts are **both** embedded in workflow **and** reachable as dedicated Foundation / Today nav items. Neither surface is removed.

Daily habits canonical home = **Dashboard TodayCard**. `/systems` = management. `/rhythm/daily` will redirect to Dashboard (PC-05).

Knowledge layer: Notes/Resources stay embedded on parents; **browse-only index pages** (`/knowledge/notes`, `/knowledge/resources`) added in PC-16 — not standalone editors.

### Why

- Founder confirmed every vision-aligned feature is necessary; simplicity must come from vocabulary, progressive disclosure, and contextual framing — not feature cuts.
- Preview + workspace matches patterns users already know (Notion inbox, email widget vs mail app).
- Older PARA.md rows saying "no `/anti-goals` page" contradicted Phase 9; docs needed reconciliation without reverting shipped product.

### Impact

- Source of truth: [`docs/VISION.md`](../VISION.md)
- `PARA.md` decision history updated with supersession notes
- Product-completeness track (PC-02–PC-24) executes against this locked scope
- No code changes in PC-01

---

## 2026-05-21 - Marketing truth pass (PC-02): caps, export, monthly billing

Status: Accepted

### Decision

- **JSON export** stays listed on pricing/FAQ as **"Coming soon"** until PC-22 ships — row is not removed.
- **Pro limits** on marketing match `planLimits`: 20 projects, 50 anti-goals, 10 systems/project — not "unlimited."
- **Monthly Pro pricing** toggle remains visible; selecting monthly shows **Coming soon** and disables checkout (yearly-only v1).
- **Goals vs Projects:** change only where the copy describes **product limits or app surfaces**; keep "goals" in brand/manifesto voice (e.g. FAQ "relationship with your goals").

### Why

Founder review: full feature set stays; trust requires honest caps and no false export claim. Selective terminology avoids sterile marketing while aligning spec tables with the app.

### Impact

- `src/lib/marketing-plan-copy.ts` — single source for marketing limits derived from `planLimits`
- Pricing, FAQ, how-it-works, teasers updated
- PC-22 will flip JSON export from Coming soon → shipped

---

## 2026-05-21 - JSON export shipped (PC-22)

Status: Accepted

### Decision

- **JSON export** ships at `GET /api/export` for Free and Pro — full user-created bundle, resources metadata only (no blob download).
- Rate limit **1 export / hour** per user when Upstash is configured.
- Marketing + FAQ updated from "Coming soon" → **Included in Settings**.

### Why

Trust contract: export was listed on pricing before it existed; PC-22 closes the loop without removing the row.

### Impact

- `src/lib/queries/user-export.ts`, `src/app/api/export/route.ts`, Settings export section
- `marketing-plan-copy.ts` `jsonExportLabel` → "Included in Settings"

---

## 2026-05-21 - v1.0.0 feature-complete (PC-24)

Status: Accepted

### Decision

- Product-completeness pass **PC-01 through PC-24** marks **v1.0.0 feature-complete in code**.
- Remaining **MVP_LAUNCH P0** items are **deploy-time** (env, domain, payment E2E, email deliverability) — not blockers for merging the completeness track.
- Automated guards ship: `api-auth-audit.test.ts`, extended Playwright smoke, optional authenticated E2E with `E2E_STORAGE_STATE`.

### Why

Founder can cut over to production using MVP_LAUNCH as the ops checklist without further product scope.

### Impact

- `docs/CHANGELOG.md` v1.0.0
- `docs/plan/MVP_LAUNCH.md` last reviewed 2026-05-21
- OG image at `/opengraph-image`

---

## 2026-05-21 - Knowledge index nav deferral (PC-16)

Status: Accepted

### Decision

Ship `/knowledge/notes` and `/knowledge/resources` as **browse-only index pages** reachable via **Settings**, **global search (⌘K)**, and cross-links — but **do not add sidebar nav entries** until user testing confirms demand.

### Why

PARA embeds notes/resources on parents; a top-level nav item risks feeling like a second editor surface. Settings + search keeps power users covered without cluttering the Plan group prematurely.

### Impact

- `deriveRouteLabel` handles knowledge routes for breadcrumbs
- `/notes` redirects to `/knowledge/notes`
- PC-17 will add entity-page "View all" links and Quick Capture polish
