> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Product Completeness — Master Plan

**Track:** Product Completeness (PC)  
**Starts after:** Dashboard improvisation Phases 0–14 ✅  
**North star:** Full PARA vision + user-review gaps closed, with **simplicity through clarity** — not feature removal.

---

## 0. Simplicity strategy (read first)

You keep **all 11 sidebar destinations** and every cross-cutting feature (Drifts, Anti-goals, Notes, Resources, four execution types, three rhythm cadences, Analytics, Wrapped). That is correct per [`PARA.md`](../dashboard-improvisation/PARA.md) and Phase 9 IA decisions.

**Simplicity is achieved by:**

| Lever | What changes | What stays |
|-------|--------------|------------|
| **Vocabulary** | One word everywhere (Project, not Goal) | All entities |
| **Hierarchy** | User learns *Today → Week → Quarter → Compass* as *intent*, nav groups as *implementation* | 4 groups, 11 items |
| **Contextual depth** | Dashboard = preview; dedicated pages = full power | Both Drift inbox surfaces |
| **Progressive disclosure** | Project detail defaults to Tasks + Systems; KRs/checkpoints advanced | All four execution types |
| **Honest caps** | Pricing says "20 projects" not "unlimited" | Pro tier limits |
| **Closed loops** | Create project anywhere; export your data; email nudges | Full CRUD everywhere |

**Explicit non-goals for this track:**

- Removing `/drifts`, `/anti-goals`, `/wrapped`, or rhythm cadences  
- Collapsing Task / KeyResult / Checkpoint / System into one type  
- Echo AI (deferred per `DECISIONS.md`)  
- Team/collaboration features  

---

## 1. Global pre-flight (every phase)

Read before starting **any** PC phase:

1. [`docs/PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) — data flow, API patterns, quotas  
2. [`.cursor/rules/general.mdc`](../../.cursor/rules/general.mdc) — TS, imports, no global store  
3. [`.cursor/rules/api-routes.mdc`](../../.cursor/rules/api-routes.mdc) — if touching `/api/*`  
4. [`.cursor/rules/database.mdc`](../../.cursor/rules/database.mdc) — if touching schema  
5. [`.cursor/rules/components.mdc`](../../.cursor/rules/components.mdc) — if new UI  
6. [`.cursor/rules/naming.mdc`](../../.cursor/rules/naming.mdc) — Project not Goal in new code  

## 2. Global post-flight (every phase)

Before merge:

- [ ] `npm run build` exit 0  
- [ ] `npx tsc --noEmit` exit 0  
- [ ] `npx prisma migrate status` clean (if schema touched)  
- [ ] Manual smoke: every touched route loads + primary flow completes  
- [ ] No new `any` without justification  
- [ ] `PROGRESS.md` updated  
- [ ] Consequential scope changes → append `docs/plan/DECISIONS.md`  

---

# Wave A — Governance & truth

## PC-01 — Vision reconciliation & scope lock

**Goal:** Resolve intentional tensions between original PARA embed-only plan and Phase 8–9 shipped IA **without removing features**.

**Addresses:** User report §5–7 (features aren't unnecessary; need clarity on *why* both surfaces exist)

**Pre-flight:**
- [`PARA.md`](../dashboard-improvisation/PARA.md) § Decision history (lines 105–122 vs Phase 9)
- [`DECISIONS.md`](../plan/DECISIONS.md) — Quick Capture hybrid, sidebar IA
- [`nav-config.ts`](../../src/lib/nav-config.ts)

**Scope IN:**
- Write `docs/product-completeness/VISION.md` (~2 pages):
  - **Dual-surface pattern:** Dashboard/card = *at-a-glance*; `/drifts`, `/anti-goals` = *full workspace* (same as Notion: inbox widget + inbox page)
  - **Daily habits:** canonical home = Dashboard TodayCard; `/systems` = manage; `/rhythm/daily` = deep link alias → redirect (Phase PC-05 implements redirect)
  - **11 nav items mapped to user intent:** Today / Plan / Reflect / Foundation
- Update `PARA.md` decision table with 2026-05-21 reconciliation row (embed + dedicated page is intentional)
- Append `DECISIONS.md` entry: "Dual-surface IA for Drifts and Anti-goals"

**Scope OUT:** Code changes (doc-only phase)

**Acceptance:**
- Any contributor can answer "why is Drift inbox in nav AND on dashboard?" from `VISION.md`
- No feature removal listed as recommendation

**Effort:** 0.5 day · **Dependencies:** none

---

## PC-02 — Marketing & pricing truth pass

**Goal:** Every public claim matches shipped product and `planLimits`.

**Addresses:** JSON export promise; "unlimited" Pro; Goals vs Projects; wizard vs onboarding

**Pre-flight:**
- [`config.ts`](../../src/lib/config.ts) `planLimits`
- [`pricing-compare.tsx`](../../src/components/marketing/pricing-compare.tsx), [`pricing-plans.tsx`](../../src/components/marketing/pricing-plans.tsx)
- [`faq/page.tsx`](../../src/app/(marketing)/faq/page.tsx), [`how-it-works/page.tsx`](../../src/app/(marketing)/how-it-works/page.tsx)
- `DECISIONS.md` — "Marketing claims must match shipped depth"

**Scope IN:**
- Replace "Goals" → "Projects" across marketing MDX/metadata
- Pro caps: "Up to 20 projects", "50 anti-goals", "10 systems per project" (exact numbers from config)
- JSON export row: change to **"JSON export — coming in Settings (PC-22)"** OR remove until PC-22 ships (pick one; document in DECISIONS)
- "Yearly planning wizard" → "90-second onboarding + year-round editing"
- Monthly pricing toggle: hide or label "Coming soon" if yearly-only v1
- `siteConfig.description` keywords: align to Projects/PARA

**Scope OUT:** Building export (PC-22)

**Acceptance:**
- Grep marketing for `\b[Gg]oals\b` in product-feature context → zero false positives
- Pricing table numbers match `planLimits.PRO` verbatim
- FAQ does not claim unbuilt export as shipped (unless PC-22 done first)

**Effort:** 1 day · **Dependencies:** PC-01 (wording locked)

---

# Wave B — Language & mental model

## PC-03 — Goal → Project language sweep (in-app)

**Goal:** Zero user-facing "goal" strings where "project" is meant.

**Addresses:** Terminology confusion; weekly review "Go to goals"; Quick Actions label

**Pre-flight:**
- [`naming.mdc`](../../.cursor/rules/naming.mdc)
- Grep: `goal|Goal` in `src/components/check-in`, `src/components/onboarding`, `src/components/dashboard`

**Scope IN:**
- Rename UI copy in: `weekly-check-in-form`, `weekly-plan-form`, `weekly-past-view`, `monthly-*`, `quarterly-*`, `onboarding-wizard`, `quick-actions.tsx`
- Rename TypeScript **display** types: `interface Goal` → `interface ProjectRow` in check-in components (local aliases only; no schema rename)
- Rename state vars: `goalRatings` → `projectRatings`, etc.
- Onboarding API body fields: keep backward-compat (`goalTitle` accepted) but UI sends `projectTitle`; document in API JSDoc
- Sidebar upsell strings
- Empty states: "Add projects to review your week" + link to `/projects`

**Scope OUT:** DB table renames (already `@@map("goals")`); deleting legacy `/api/goals` if any ghost files

**Acceptance:**
- Grep `src/` for user-visible "goal" (exclude `@@map`, comments, `LifeCategory` unrelated) → clean
- Weekly review empty state links to `/projects`
- `next build` clean

**Effort:** 1–1.5 days · **Dependencies:** PC-02

---

## PC-04 — LifeCategory ↔ Area bridge copy

**Goal:** User understands onboarding picks *life areas* (categories) that map to PARA *Areas*.

**Addresses:** Onboarding vs Areas confusion; wheel categories vs custom areas

**Pre-flight:**
- [`PARA.md`](../dashboard-improvisation/PARA.md) § Why not rename LifeCategory
- [`onboarding-wizard.tsx`](../../src/components/onboarding/onboarding-wizard.tsx)
- [`areas/page.tsx`](../../src/app/(app)/areas/page.tsx)

**Scope IN:**
- Onboarding step 2: subtitle "These become your life areas — you'll refine them in Areas"
- Onboarding step 3: "Your first **project**" (not goal); pick category = pick area
- `/areas` page header: one-line explainer linking LifeCategory colors to default areas
- `/wheel` editor: tooltip "Categories match your Areas"
- Optional: `AreaCard` shows `LifeCategory` label as subtitle

**Scope OUT:** Merging LifeCategory enum into Area model

**Acceptance:**
- Fresh user path: onboarding → `/areas` shows 6 defaults matching wheel picks
- No new API/schema

**Effort:** 0.5–1 day · **Dependencies:** PC-03

---

## PC-05 — Daily surface unification

**Goal:** One mental model for daily habits — **Dashboard is home**; other routes support, don't compete.

**Addresses:** Triple daily surfaces; Quick Actions sending to `/rhythm/daily`

**Pre-flight:**
- [`nav-config.ts`](../../src/lib/nav-config.ts) comments (lines 54–58)
- [`today-card.tsx`](../../src/components/dashboard/today-card.tsx)
- [`rhythm/daily/page.tsx`](../../src/app/(app)/rhythm/daily/page.tsx)

**Scope IN:**
- `quick-actions.tsx`: "Daily Habits" → links to `/dashboard` (anchor `#today`) OR `/systems` — not `/rhythm/daily`
- `RhythmHeader` daily tab: keep for cadence completeness but label "Today (Dashboard)"
- `/rhythm/daily`: soft redirect to `/dashboard#today` (preserve analytics on redirect usage) OR render `<TodayCard>` + link to `/systems` for management (pick redirect for simplicity)
- Dashboard primary CTA logic: prefer `/dashboard#today` over `/rhythm/daily`
- Quick Capture palette: update "Daily Habits" target
- Document in `VISION.md`: daily canonical surface

**Scope OUT:** Removing `/rhythm/daily` route entirely (keep redirect for bookmarks)

**Acceptance:**
- No product copy directs new users to `/rhythm/daily` as primary
- `/rhythm/daily` redirects or clearly defers to Dashboard
- Systems completion still works from TodayCard

**Effort:** 0.5–1 day · **Dependencies:** PC-01

---

# Wave C — CRUD & plan lifecycle

## PC-06 — Project creation & area context

**Goal:** Add a project from anywhere in the PARA hierarchy.

**Addresses:** Missing "New project" on populated list; no create from area detail

**Pre-flight:**
- [`PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) §3 API routes
- [`api/projects/route.ts`](../../src/app/api/projects/route.ts), [`quick-start/route.ts`](../../src/app/api/projects/quick-start/route.ts)
- [`projects/page.tsx`](../../src/app/(app)/projects/page.tsx)
- [`areas/[areaId]/page.tsx`](../../src/app/(app)/areas/[areaId]/page.tsx)

**Scope IN:**
- `/projects` header: **"New project"** button always visible (opens dialog or inline quick-start)
- Reuse `<ProjectQuickStart>` with optional `defaultAreaId` prop
- Area detail: **"Add project in this area"** CTA → quick-start with `areaId` pre-filled
- API: ensure `POST /api/projects/quick-start` accepts optional `areaId` (validate ownership)
- Free cap: inline `<ProUpsellCard>` at limit per production standards (402 + upgradeUrl)
- Tests: `api/projects/route.test.ts` extend for areaId

**Scope OUT:** Bulk import projects

**Acceptance:**
- User with 3 projects can add 4th without visiting empty state
- Project created from Health area has `areaId` set
- Cap enforced UI + API

**Effort:** 1–1.5 days · **Dependencies:** PC-03

---

## PC-07 — Tasks surface completeness

**Goal:** `/tasks` supports capture, not just triage.

**Addresses:** No task create on tasks page

**Pre-flight:**
- [`tasks/page.tsx`](../../src/app/(app)/tasks/page.tsx), [`tasks-board.tsx`](../../src/components/tasks/tasks-board.tsx)
- [`api/projects/[projectId]/tasks/route.ts`](../../src/app/api/projects/[projectId]/tasks/route.ts)
- [`planLimits`](../../src/lib/config.ts) `maxTasksPerProject`

**Scope IN:**
- Header action: **"Add task"** → dialog with project picker + description + optional due date
- Inline add row at top of active tab (Today / This week / Backlog)
- Default project: last-used or first primary project (localStorage key `tasks:lastProjectId`)
- Keyboard: Quick Capture palette "New task" unchanged
- Empty tab copy: points to add button, not only "open a project"

**Scope OUT:** `GET /api/tasks` top-level list API (keep server query pattern)

**Acceptance:**
- Create task from `/tasks` appears in correct bucket
- 402 at per-project task cap
- One API test for create path

**Effort:** 1 day · **Dependencies:** PC-06

---

## PC-08 — YearlyPlan lifecycle

**Goal:** Users can manage their year without re-onboarding.

**Addresses:** No edit theme, archive year, start new year

**Pre-flight:**
- [`20-foundation.prisma`](../../prisma/schema/20-foundation.prisma) `YearlyPlan`
- [`api/onboarding/route.ts`](../../src/app/api/onboarding/route.ts)
- [`settings-form.tsx`](../../src/components/settings/settings-form.tsx)

**Scope IN:**
- **Schema:** optional `archivedAt DateTime?` on `YearlyPlan` if not present; migration `YYYYMMDD_yearly_plan_lifecycle`
- **API:** `PATCH /api/yearly-plan/[planId]` — theme, reflections JSON (Zod); `POST /api/yearly-plan/archive`
- **API:** `POST /api/yearly-plan` — create new year (Pro: up to `maxPlans`; Free: 1 active)
- **Query:** `lib/queries/yearly-plan.ts`
- **UI:** Settings → **"Your year"** section: edit theme, view year, archive, start new year (with confirm)
- Dashboard: show `activePlanYear` theme subtly in header or TodayCard
- Guard: archiving plan requires no orphaned flows — soft warning if active projects exist

**Scope OUT:** Multi-plan simultaneous active years (one ACTIVE at a time)

**Acceptance:**
- Edit 2026 theme without onboarding
- Archive 2026 → prompted to create 2027 or stay read-only on Wrapped
- Free user blocked from 2nd concurrent plan with 402

**Effort:** 2 days · **Dependencies:** PC-03 · **Migration:** yes (1)

---

## PC-09 — DailyState schema promotion

**Goal:** Anti-goal "held the line" is a first-class field, not a reflection prefix hack.

**Addresses:** Prototype encoding in reflection text; export/search reliability

**Pre-flight:**
- [`70-system.prisma`](../../prisma/schema/70-system.prisma) `DailyState`
- [`api/today/route.ts`](../../src/app/api/today/route.ts)
- [`today-card.tsx`](../../src/components/dashboard/today-card.tsx) JSDoc
- Phase 6 PROGRESS follow-up

**Scope IN:**
- Schema: ensure `antiGoalHeldId` + `antiGoalHeld Boolean?` used (may exist — wire properly)
- Migration backfill: parse existing `anti-goal:*` prefixes → columns; strip prefix from reflection
- API PATCH: accept `antiGoalHeldId`, `antiGoalHeld` explicitly
- TodayCard: read/write columns directly
- Analytics query: can aggregate held/slipped rates (optional stub for PC-20)

**Scope OUT:** Multiple anti-goals per day (still one rotating)

**Acceptance:**
- Toggle pill survives reload without reflection pollution
- Old rows migrated safely
- `grep anti-goal:` in reflection → only legacy unmigrated (zero after backfill)

**Effort:** 1–1.5 days · **Dependencies:** none · **Migration:** yes (1)

---

## PC-10 — Rhythm workspace consolidation

**Goal:** One shared cadence shell; less duplicated code; same user-facing power.

**Addresses:** Over-engineering (triplicate tab components); review form weight

**Pre-flight:**
- [`rhythm-workspace-shell.tsx`](../../src/components/rhythm/rhythm-workspace-shell.tsx)
- `weekly-workspace-tabs`, `monthly-workspace-tabs`, `quarterly-workspace-tabs`
- [`PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) § file size (~300 lines)

**Scope IN:**
- Create `components/rhythm/cadence-workspace.tsx`:
  - Props: `cadence`, `planTab`, `reviewTab`, `periodBar`, `sidebar`, `defaultTab`
- Refactor weekly/monthly/quarterly pages to use it (delete duplicate tab wrappers)
- Merge shared plan form helpers (`buildPlanState`, intentions, top-3) into `lib/rhythm/plan-form-state.ts`
- **UX:** no field reduction — same inputs, cleaner layout spacing only
- Fix recap back-link: monthly/quarterly recap → respective rhythm page

**Scope OUT:** Removing review template editor; reducing per-project review fields

**Acceptance:**
- Net LOC reduction in rhythm components
- All three cadences pass manual smoke (plan + review save)
- Recap back navigation correct

**Effort:** 2–3 days · **Dependencies:** PC-03

---

# Wave D — Simplicity layer (keep all features)

## PC-11 — Contextual hubs (Drifts · Anti-goals · Wrapped)

**Goal:** Dedicated pages feel purposeful — not duplicate nav clutter.

**Addresses:** Dual surfaces feel messy unless framed correctly

**Pre-flight:**
- `docs/product-completeness/VISION.md` (PC-01)
- [`drifts/page.tsx`](../../src/app/(app)/drifts/page.tsx), [`anti-goals/page.tsx`](../../src/app/(app)/anti-goals/page.tsx), [`wrapped/page.tsx`](../../src/app/(app)/wrapped/page.tsx)

**Scope IN:**
- **`/drifts`:** Page header explains "Process captures into tasks & notes — dashboard shows latest"
- **`/anti-goals`:** Reframe as **"Focus guardrails"** — link to Vision + show where they surface (Today, weekly review)
- **`/wrapped`:** Seasonal banner when not Dec/Jan: "Your year-end story unlocks in December"; still accessible
- Dashboard cards: "Open full inbox →" / "Manage all anti-goals →" deep links
- Optional: unresolved drift count badge on sidebar Drift inbox item

**Scope OUT:** Removing pages

**Acceptance:**
- Each dedicated page has 1-sentence "why this exists" in header
- User review question "why both?" answered in-product

**Effort:** 1 day · **Dependencies:** PC-01, PC-05

---

## PC-12 — Project detail progressive disclosure

**Goal:** Project page scannable by default; full power one click away.

**Addresses:** Project detail density; four execution types decision fatigue

**Pre-flight:**
- [`project-detail-view.tsx`](../../src/components/projects/project-detail-view.tsx) or equivalent
- [`PARA.md`](../dashboard-improvisation/PARA.md) § task-by-intent split (keep all types)

**Scope IN:**
- Default view sections: **Header · Tasks · Systems · Motivation** (expanded)
- Collapsed accordions (default closed): **Key results · Checkpoints · Notes · Resources · Anti-goals context**
- Section headers with counts: "Key results (2)"
- First-run empty hints: "Add a measurable target" in collapsed KR section
- Mobile: single column, accordions essential

**Scope OUT:** Merging KR/checkpoint into tasks

**Acceptance:**
- New project page loads with ≤4 visible blocks
- All CRUD still reachable without leaving page
- No regression in project detail tests/manual flows

**Effort:** 1.5–2 days · **Dependencies:** PC-06

---

## PC-13 — Focus signals & priority context

**Goal:** Weekly plan priorities visible during execution — focus without WIP enforcement.

**Addresses:** Priority dies after leaving weekly planner; focus features not connected

**Pre-flight:**
- [`weekly-plan-form.tsx`](../../src/components/check-in/weekly-plan-form.tsx)
- [`lib/queries/weekly-workspace.ts`](../../src/lib/queries/weekly-workspace.ts)
- [`tasks-board.tsx`](../../src/components/tasks/tasks-board.tsx)

**Scope IN:**
- Query helper: `getWeeklyPriorityProjectIds(userId, weekContext)`
- Dashboard TodayCard or projects overview: **"This week's priorities"** chips (max 3)
- `/tasks`: priority projects get subtle amber left border or badge
- `/projects` list: priority badge on card this week
- Optional gentle nudge (not blocking): "6 active projects · 3 prioritized this week" on dashboard
- **No hard WIP limit** — signal only

**Scope OUT:** Blocking work on non-priority projects

**Acceptance:**
- Priorities set in weekly plan appear on dashboard until week ends
- Changing week updates badges

**Effort:** 1.5 days · **Dependencies:** PC-10

---

## PC-14 — Onboarding → week-1 guided path

**Goal:** Bridge 90-second onboarding to full 11-destination product without overwhelm.

**Addresses:** Onboarding vs marketing mismatch; week-1 drop-off

**Pre-flight:**
- [`onboarding-wizard.tsx`](../../src/components/onboarding/onboarding-wizard.tsx)
- [`dashboard/page.tsx`](../../src/app/(app)/dashboard/page.tsx)

**Scope IN:**
- Post-onboarding **checklist card** on dashboard (dismissible, persisted `User.preferences` JSON or localStorage v1):
  1. Add 2 more projects (links `/projects`)
  2. Set this week's plan (links `/rhythm/weekly?tab=plan`)
  3. Capture a thought (opens ⌘K hint)
  4. Complete first Friday review
  5. Visit your Vision (`/vision`)
- Checklist auto-completes steps from server data (project count, weekly plan exists, etc.)
- Onboarding finish toast: "Start with Today — everything else waits"

**Scope OUT:** Full interactive product tour library

**Acceptance:**
- New user sees ≤5 checklist items, 2–3 already done after onboarding
- Dismiss persists

**Effort:** 1.5–2 days · **Dependencies:** PC-04, PC-06 · **Schema:** optional `User.preferences Json?`

---

# Wave E — Knowledge & search

## PC-15 — Global search

**Goal:** Find anything across PARA hierarchy.

**Addresses:** Missing search; notes invisible at scale

**Pre-flight:**
- [`PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) § list GETs paginate/cap
- [`quick-capture-button.tsx`](../../src/components/shared/quick-capture-button.tsx) cmdk pattern

**Scope IN:**
- **API:** `GET /api/search?q=&limit=20` — projects, tasks, notes (body snippet), drifts (inbox), areas (cap payload)
- **Query:** `lib/queries/search.ts` — Postgres `contains` insensitive; tenant-scoped
- **UI:** Extend Quick Capture palette OR topbar search icon → same cmdk dialog with "Search" mode
- Results grouped by type; click navigates to parent surface
- Rate limit: 30 req/min per user

**Scope OUT:** Full-text search engine (Meilisearch); searching resource file contents

**Acceptance:**
- Search "sleep" finds note on Health area
- Empty query shows recent projects + quick actions
- p95 < 500ms on realistic data (manual check)

**Effort:** 2 days · **Dependencies:** PC-03

---

## PC-16 — Knowledge index pages

**Goal:** Transversal notes/resources browseable without standalone PARA violation — **index, not editor**.

**Addresses:** No global notes/resources view

**Pre-flight:**
- [`PARA.md`](../dashboard-improvisation/PARA.md) § Notes attached to entities
- [`notes-block.tsx`](../../src/components/knowledge/notes-block.tsx)

**Scope IN:**
- **`/knowledge/notes`** (or `/notes` with redirect alias): list all notes with parent breadcrumb (Area › Project › …)
- **`/knowledge/resources`**: list links + files similarly
- Add under **Plan** group OR accessible only via search + Settings link first (defer nav add until user testing — document choice in DECISIONS)
- Filter: by parent type, by area
- Row actions: open parent, edit inline (reuse NotesBlock patterns)
- Queries: `listNotesForUser`, `listResourcesForUser` with cursor pagination

**Scope OUT:** Standalone note editor with backlinks (future)

**Acceptance:**
- 50 notes paginated; no unbounded payload
- Click note → navigates to project/area detail with anchor

**Effort:** 2 days · **Dependencies:** PC-15

---

## PC-17 — Note & resource discoverability polish

**Goal:** Knowledge layer visible from entity pages and search.

**Addresses:** Knowledge dies when embedded only

**Pre-flight:**
- PC-16 routes
- Vision page (notes yes; resources no)

**Scope IN:**
- Vision page: add `<ResourcesBlock parentType="VISION">` if schema allows — else extend `ParentType` enum + migration
- Area/project detail: "View all notes" link when count > 3 → filtered knowledge index
- Quick Capture: "Search notes" action
- Empty states reference knowledge index

**Scope OUT:** FILE preview inline

**Acceptance:**
- Vision can attach link resources if enum extended
- Count links work

**Effort:** 1–1.5 days · **Dependencies:** PC-16 · **Migration:** maybe (ParentType)

---

# Wave F — Compass ↔ execution

## PC-18 — Vision ↔ Project linking

**Goal:** Life desires connect to this year's work.

**Addresses:** Vision disconnected from projects

**Pre-flight:**
- [`30-projects.prisma`](../../prisma/schema/30-projects.prisma)
- [`vision/items`](../../src/app/api/vision/items/route.ts)

**Scope IN:**
- **Schema:** `Project.visionItemId String?` optional FK → `VisionItem` (migration)
- Project detail: optional "Serves vision" dropdown (list user's vision items)
- Vision card: show linked projects count + chips linking to `/projects/[id]`
- Dashboard foundation strip (optional): "1 vision milestone has active projects"

**Scope OUT:** Auto-suggest links via AI

**Acceptance:**
- Link project to milestone; both surfaces show relationship
- Delete vision item → project FK nulls (SetNull)

**Effort:** 1.5–2 days · **Dependencies:** PC-12 · **Migration:** yes

---

## PC-19 — Area health rollup

**Goal:** Answer "how is Health vs Career?" without visiting every area.

**Addresses:** No area health at a glance

**Pre-flight:**
- [`lib/queries/areas.ts`](../../src/lib/queries/areas.ts)
- Wheel snapshots

**Scope IN:**
- Extend areas query: `healthScore` composite (project on-track %, weekly ratings avg, wheel category delta if available)
- **`/areas` grid:** subtle health indicator per card (green/amber/quiet — not gamified red)
- **Dashboard:** optional compact "Areas pulse" row (6 dots)
- Document scoring in code comment — transparent, not ML

**Scope OUT:** Automated recommendations

**Acceptance:**
- Area with no projects shows "quiet" not error
- Score updates after weekly review

**Effort:** 1.5 days · **Dependencies:** PC-13

---

## PC-20 — Analytics ↔ rhythm loop

**Goal:** Analytics pulls user into review; DailyState feeds charts.

**Addresses:** Empty analytics; daily mood disconnected

**Pre-flight:**
- [`analytics/page.tsx`](../../src/app/(app)/analytics/page.tsx)
- Phase 7 deferred DailyState charts

**Scope IN:**
- Add DailyState mood/energy trend lines (minimum 7 days data)
- Empty analytics CTA: "Complete your weekly review" → `/rhythm/weekly?tab=review`
- Surface streak + systems consistency from existing queries
- ProGate unchanged

**Scope OUT:** Predictive insights

**Acceptance:**
- 30 days DailyState → chart renders
- Empty state actionable

**Effort:** 1.5–2 days · **Dependencies:** PC-09, PC-10

---

# Wave G — Retention & portability

## PC-21 — Notifications & email cadence

**Goal:** Replace Settings placeholder with working opt-in email.

**Addresses:** Missing reminders; rhythm dies without nudges

**Pre-flight:**
- [`settings-form.tsx`](../../src/components/settings/settings-form.tsx) Notifications section
- [`MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) email + crons
- Existing cron routes under `api/cron/`

**Scope IN:**
- **Schema:** `User.emailPreferences Json` or columns: `weeklyReviewReminder`, `monthlyNudge`, `quarterlyNudge` (booleans, default true)
- **API:** `PATCH /api/user/me` extend; cron jobs respect preferences
- **UI:** Settings toggles functional (not dashed placeholder)
- Wire crons: Friday weekly, 1st monthly, quarter start quarterly
- Unsubscribe link in emails → Settings deep link

**Scope OUT:** Push notifications; SMS

**Acceptance:**
- Toggle off weekly → cron skips user (test with dev cron trigger)
- Settings matches shipped MVP_LAUNCH email claim

**Effort:** 2–3 days · **Dependencies:** none · **Migration:** maybe

---

## PC-22 — JSON export & data portability

**Goal:** Ship promised export; trust contract complete.

**Addresses:** JSON export marketed but missing

**Pre-flight:**
- Marketing copy from PC-02 (must say shipped after this phase)
- [`PRODUCTION_STANDARDS.md`](../PRODUCTION_STANDARDS.md) — cap export size / streaming for large accounts

**Scope IN:**
- **API:** `GET /api/export` → JSON bundle: user, yearlyPlans, areas, projects, tasks, systems, notes, resources (metadata only for files), drifts, check-ins, wheel, vision, anti-goals, dailyStates
- **UI:** Settings → **Export your data** button → download `yearinreview-export-YYYY-MM-DD.json`
- Rate limit: 1 export / hour
- Pro: same export (Wrapped PDF deferred to P2)
- Account delete flow: remind export first

**Scope OUT:** PDF export; scheduled auto-export

**Acceptance:**
- FAQ claim valid
- Export round-trips all user-created entities
- 10k-row account completes < 30s or streams

**Effort:** 2 days · **Dependencies:** PC-02, PC-08, PC-09

---

# Wave H — Ship readiness

## PC-23 — Mobile & responsive polish

**Goal:** Daily loop works thumb-first.

**Addresses:** Mobile not optimized; rhythm sidebars heavy

**Pre-flight:**
- [`MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) P1 mobile spot-check
- [`mobile-nav.tsx`](../../src/components/shared/mobile-nav.tsx)

**Scope IN:**
- Dashboard TodayCard: tap targets ≥44px; mood pills wrap
- Rhythm workspaces: sidebar **collapses below** main on `<md` (drawer or stack)
- Project detail accordions (PC-12) verified mobile
- Drifts board: swipe-friendly row actions OR bottom sheet process dialog
- `/tasks` board: single column
- Fix any horizontal scroll on iPhone SE

**Scope OUT:** Native app

**Acceptance:**
- Manual pass: iPhone SE, iPhone 14, one Android
- No blocking UX on weekly review submit mobile

**Effort:** 2–3 days · **Dependencies:** PC-10, PC-12

---

## PC-24 — Launch QA & ops completion

**Goal:** Complete MVP_LAUNCH P0/P1; product defensible as v1.0.

**Pre-flight:**
- [`MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md) full checklist
- [`DEPLOYMENT.md`](../DEPLOYMENT.md)
- [`e2e/smoke.spec.ts`](../../e2e/smoke.spec.ts)

**Scope IN:**
- Run P0 infra checklist (env, payments, crons, blob, redis)
- E2E extend: onboarding → add project → weekly review → export
- Lighthouse a11y ≥85 on `/dashboard`, `/rhythm/weekly`, `/projects`
- Auth spot-audit all API routes
- OG image if still missing
- Final grep: goals marketing, export claims, unlimited claims
- Update `MVP_LAUNCH.md` last reviewed date
- Tag release `v1.0.0` in changelog

**Scope OUT:** Sentry/PostHog (P2)

**Acceptance:**
- All P0 boxes checked or explicitly waived with reason
- `docs/product-completeness/PROGRESS.md` all ✅
- Founder sign-off: "feature-complete"

**Effort:** 2–4 days · **Dependencies:** PC-01 through PC-23

---

## 3. Dependency graph (simplified)

```
PC-01 ─┬─► PC-02 ─► PC-03 ─┬─► PC-04 ─► PC-14
       │                    ├─► PC-06 ─► PC-07
       │                    ├─► PC-10 ─► PC-13 ─► PC-19
       │                    └─► PC-15 ─► PC-16 ─► PC-17
       └─► PC-05 ─► PC-11
PC-08 (independent)   PC-09 ─► PC-20
PC-12 ─► PC-18
PC-21 (independent)   PC-22 (after PC-08, PC-09)
PC-23 (after D-wave)  PC-24 (last)
```

**Parallelizable pairs** (if two contributors):

- PC-08 + PC-09  
- PC-21 + PC-15  
- PC-19 + PC-18 (after PC-12/13)  

---

## 4. Definition of done — "full-fledged product"

The product is **feature-complete v1.0** when:

1. **Trust:** Marketing matches product; export works; caps honest  
2. **Language:** Projects everywhere; Areas explained  
3. **CRUD:** Create project/task from natural surfaces; year plan editable  
4. **Simplicity:** Daily home clear; project detail scannable; hubs explained  
5. **Knowledge:** Search + browse notes/resources  
6. **Compass:** Vision links to projects; area health visible  
7. **Retention:** Email reminders opt-in/out  
8. **Ship:** MVP_LAUNCH P0 complete; mobile passable  

---

## 5. Estimated timeline

| Pace | Calendar |
|------|----------|
| 2 phases / week | ~12 weeks |
| 3 phases / week | ~8 weeks |
| Sprint bursts (4/week) | ~6 weeks (higher mistake risk — not recommended) |

**Recommended:** 2–3 phases/week with strict post-flight checklists.

---

## 6. What we explicitly keep (user confirmation)

| Feature | Simplicity approach |
|---------|-------------------|
| 11 sidebar items | Intent groups + PC-14 checklist |
| `/drifts` + dashboard inbox | PC-11 contextual framing |
| `/anti-goals` + embedded | PC-11 + Foundation framing |
| `/wrapped` in Foundation | PC-11 seasonal framing |
| `/rhythm/daily` route | PC-05 redirect to Dashboard |
| Task / KR / Checkpoint / System | PC-12 accordions |
| Monthly/quarterly templates | Keep; consolidate code in PC-10 |
| Four rhythm pages | Keep; shared shell PC-10 |
| Pro gating monthly/quarterly | Keep; analytics CTA PC-20 |

---

## 7. Parking lot (post v1.0)

- Echo AI companion  
- PDF export  
- Calendar view for tasks  
- Accountability partner / sharing  
- File preview in browser  
- Note backlinks `[[Project]]`  
- Streak shields UX  
- `/recap/year` route  
- Password auth  

Log picks in `PROGRESS.md` parking lot when deferred from a PC phase.
