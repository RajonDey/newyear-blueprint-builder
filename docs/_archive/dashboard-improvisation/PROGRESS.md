> **Archived 2026-05-21** — execution history. See [`CHANGELOG.md`](../../CHANGELOG.md) and [`plan/DECISIONS.md`](../plan/DECISIONS.md) for outcomes.

# Dashboard Improvisation — Progress Tracker

Update this after every phase. The plan itself lives in [`PLAN.md`](./PLAN.md).

## Legend

- ⬜ Not started
- 🟡 In progress
- ✅ Done
- ⏭️ Skipped (with reason)
- 🔁 Deferred / reopened

---

## Phase status

**Target ship date:** end of May 2026. One phase per working day where possible.

| # | Phase | Status | Date | Build | Notes |
|---|---|---|---|---|---|
| 0 | Foundation primitives | ✅ | 2026-05-12 | clean | 8 primitives, 3 lib helpers, 1 cursor rule. No visible UI change. |
| 1 | `/dashboard` Home (Today) | ✅ | 2026-05-12 | clean | TodayCard with tap-to-complete. Stats, wheel, goals, next-step, achievements restyled. |
| 2 | **Schema + Naming foundation** *(infra-only)* | ✅ | 2026-05-14 | clean | Goal→Project, Action→Task, DailySystem→System renames via `@@map`. New models: Area, Vision/VisionItem, Note, Resource, Drift, DailyState. Multi-file schema. Two migrations (`baseline` + `para_foundation`). |
| 3 | **Foundation surfaces** | ✅ | 2026-05-14 | clean | `/wheel`, `/vision`, `/areas`, `/areas/[id]` live. Sidebar Foundation group lights up. 6 API routes added. |
| 4 | **Planning surfaces** | ✅ | 2026-05-14 | clean | `/goals` (redesign), `/goals/[goalId]` (Area breadcrumb + Tasks block), `/tasks` (new), `/systems` (new top-level). |
| 5 | **Cross-cutting** | ✅ | 2026-05-14 | clean | NotesBlock + ResourcesBlock + AntiGoalsDisplay embedded. Vercel Blob file uploads (Pro-only). Quick Capture → Drift inbox → Process dialog. |
| 6 | **Rhythm + Today depth** | ✅ | 2026-05-14 | clean | TodayCard wired to DailyState (prompt · reflection · mood · energy · anti-goal pill). `/rhythm` editorial landing. Quarterly switched to `<ProGate>`. |
| 7 | **Insights + Settings + Cleanup** | ✅ | 2026-05-15 | clean | Settings redesigned editorial. Last `<PremiumGate>` callsites migrated to `<ProGate>`. `/plan/new` + `/plan/[year]` are now permanent redirects. Dropped 13 dead files (wizard tree, welcome-dashboard, wheel-icebreaker, icebreaker-upsell, premium-gate, legacy goal-notes UI + API). `goal_notes` table dropped via `20260515000000_drop_goal_notes`. Analytics + Wrapped + Settings cleared of `MandalaWatermark`. |
| 8 | **Capture + Drifts hub** | ✅ | 2026-05-15 | clean | Quick Capture is now a hybrid: textarea-default + cmdk command palette (`/` to switch, ⌘⇧K to open directly into palette). New `/drifts` triage page with Inbox/Resolved tabs + server-side search. Sidebar gains a "Drift inbox" entry under Home. `<DriftProcessDialog>` extracted into `components/drifts/` and shared by the dashboard card + the page. |
| 9 | **IA cleanup — sidebar restructure** | ✅ | 2026-05-15 | clean | Collapsed 6 sidebar groups → **4** (Today · Plan · Reflect · Foundation). 14 sidebar items → **11**. Removed redundant *Daily Habits* entry (data already on TodayCard + `/systems`). Moved *Anti-goals* and *Year Wrapped* into Foundation (they're year-level reference, not weekly planning). Moved *Settings* + *Admin* out of the sidebar entirely → topbar avatar dropdown (Linear/Notion pattern). |
| 10 | **Repo hygiene — cleanup pass** | ✅ | 2026-05-15 | clean | Deleted 9 dead source files (~35KB) — the wizard backend tail that Phase 7 missed. Removed 4 unused npm deps (zustand · react-query · react-hook-form · @hookform/resolvers) — `<Providers>` now only mounts `<Toaster>`. Cleaned `docs/` (deleted DATABASE.md + PRODUCT_REVIEW.md; rewrote ARCHITECTURE.md; trimmed DEPLOYMENT.md). Cleaned `docs/plan/` (deleted RISKS.md + CHANGELOG_EXECUTION.md + `_archive/`; freshened MVP_LAUNCH.md + README.md; appended 4 Phase 7-9 decisions to DECISIONS.md). Updated `.cursor/rules/dashboard.mdc` + `components.mdc` to drop stale `<PremiumGate>` references. Deleted `.tmp/` + empty `.env`; added `.tmp/` to `.gitignore`. Created root **README.md**. |
| 11 | **PARA CRUD completeness** | ✅ | 2026-05-15 | clean | Area edit/delete/reorder UI (per-card ⋯ menu + edit dialog). Project ↔ Area moves (PUT `/api/goals/[id]` accepts `areaId`/`sortOrder`; "Move" button beside the breadcrumb). Task ↔ Project moves (PATCH `/api/tasks/[id]` accepts `projectId`; row menu sub-list on `/tasks`). System ↔ Project moves (PATCH `/api/systems/[id]` accepts `projectId`; row dropdown — enforces per-project cap on the target). VisionItem reorder wired to existing `/api/vision/items/reorder` via per-card menu. Project list reorder (new `POST /api/goals/reorder` + ⋯ menu on `/goals` cards; reorder is bucket-local within Primary/Secondary). New endpoints: `POST /api/areas/reorder`, `POST /api/goals/reorder`. |
| 12 | **Content CRUD + dead-code purge** | ✅ | 2026-05-15 | clean | In-place edit for Notes (PATCH already existed; wired Pencil icon + textarea swap on `<NotesBlock>`). Inline edit for Resources — new `PATCH /api/resources/[id]` (LINK only — FILE rows are delete/re-upload) + dual-input swap on hover. Anti-Goals inline edit — new `PATCH /api/anti-goals/[id]` (description + category) + pencil icon on each card. Drifts inline edit — new `PATCH /api/drifts/[id]` (refuses resolved drifts so audit stays clean) + edit toggle in `<DriftsBoard>` inbox rows. ProjectCheckpoint create + delete — new `POST /api/goals/[goalId]/checkpoints` + `DELETE /api/checkpoints/[id]`; goal-detail-view always renders the card now with an "Add" affordance, quarter picker, and a hover trash on each row. Wheel-of-Life correction — new `PATCH /api/wheel` updates the most recent snapshot in place; `<WheelEditor>` shows a secondary "Update last snapshot" link beside the primary Save. WeeklyCheckIn edit — new `PATCH /api/check-ins/weekly/[id]` (current ISO week only — past weeks stay locked); summary card now exposes an Edit button that drops the form back into the same form with PATCH submit. Dropped the orphan `Habit` model — schema cleared, `habits: true` includes removed from queries, `prisma/migrations/20260515120000_drop_habit/migration.sql` ships the `DROP TABLE habits`. |
| 13 | **Custom review templates** | ✅ | 2026-05-18 | clean | Per-user `ReviewTemplate` (`userId` + `ReviewCadence` unique) stores `fields` JSON. `MonthlyReview.responses` + `QuarterlyReview.responses` hold rich-text answers keyed by field keys. Defaults match the old four prompts (same keys for legacy column sync). `GET`/`PATCH /api/review-templates`; forms render dynamic `RichTextEditor` list; collapsible `<ReviewTemplateEditor>` (Pro) for reorder/add/remove/edit labels & placeholders (max 12 fields, slug keys). `getRecapData` monthly/quarterly merges `responses` over legacy columns; monthly recap `year` filter fixed to `plan.year`. Migration `20260516100000_review_templates`. |
| 14 | **Rhythm width consistency** | ✅ | 2026-05-19 | clean | `<PageContainer>` gains a `medium` (max-w-3xl) preset; `rhythm/layout.tsx` drops its hand-rolled `-m-4 sm:-m-6` + `mx-auto max-w-3xl` wrapper and now composes `<RhythmHeader>` + `<PageContainer width="medium">`. `<RhythmHeader>` consumes the same `<AppContent variant="medium">` so the cadence tabs align with the body. Parent `<main>` padding restored (no more negative-margin gymnastics) → rhythm pages now match the rest of the app's spacing rhythm. Dashboard improvisation **complete**. |
| ∞ | Future — Echo AI Companion | 🔒 | — | — | Skipped for v1 launch per Phase 8 planning. Revisit post-launch with real DAU + retention data. No waitlist tease shipped — sidebar stays focused on the engine. |

---

## Phase log

> Append a block per phase with the template below. Keep newest at the top.

<!--
### Phase X — <name>
- **Status:** ✅ / 🟡 / ⏭️
- **Date:** YYYY-MM-DD
- **Build:** `next build` exit code, key warnings
- **Surfaces touched:** list of routes / files
- **New primitives:** list
- **Backend changes:** schema / queries / API
- **Plan deltas:** anything that drifted from `PLAN.md`, with reason
- **Follow-ups:** TODOs to pick up in the next phase or a later phase
-->

### Phase 14 — Rhythm width consistency + final polish
- **Status:** ✅
- **Date:** 2026-05-19
- **Build:** `tsc --noEmit` exit 0. `next build` exit 0 (all 4 `/rhythm/*` routes accounted for). No new lint issues on touched files.
- **Why this phase existed:** the Phase 12 and 13 follow-up notes both flagged it — `/rhythm/*` pages used their own hand-rolled max-width wrapper (`max-w-3xl` inside a `-m-4 sm:-m-6` negative-margin shell that defeated the parent `<main>` padding), while every other authenticated page used `<PageContainer width="wide"|"narrow">`. The result was that rhythm sat in a different column system from the rest of the app, with subtly different vertical rhythm and edge padding. Last phase before launch felt like the right time to reconcile.
- **What shipped:**
  - **`<PageContainer>` gains a `medium` preset.** `width="medium"` resolves to `max-w-3xl` — the column rhythm pages were already using. Three presets total now: `narrow` (max-w-2xl, tight forms), `medium` (max-w-3xl, reading/forms — rhythm), `wide` (max-w-6xl, dashboards). `<AppContent>` (the underlying primitive) got the same `medium` variant.
  - **`rhythm/layout.tsx` rewritten.** Dropped the `-m-4 sm:-m-6 flex flex-col min-h-[calc(100vh-4rem)]` shell + the manual `mx-auto max-w-3xl` inner div. Now: a single `<div className="space-y-8">` wraps `<RhythmHeader />` + `<PageContainer width="medium">{children}</PageContainer>`. The parent `<main className="p-4 sm:p-6">` padding is restored — rhythm now sits in the same padded canvas as `/dashboard`, `/goals`, `/tasks`, etc.
  - **`<RhythmHeader>` aligned.** Replaced its own `<div className="px-4 sm:px-6 pt-6 sm:pt-8"><div className="mx-auto max-w-3xl">…` with `<AppContent variant="medium">`. The cadence tabs strip now lines up pixel-perfectly with the body column underneath.
  - **No sub-page changes.** Verified each `/rhythm/*` route (`daily`, `weekly`, `monthly`, `quarterly`, plus the `/rhythm` landing) renders cleanly at the inherited medium width. Sub-pages weren't asserting a max-width of their own — they were relying on the layout column, which is now consistent.
- **New primitives:** None — `<PageContainer>` extended in place.
- **Backend changes:** None.
- **Plan deltas:** None. Layout-only change, exactly as scoped.
- **Follow-ups:** None for the dashboard-improvisation track — this closes it. Remaining work for v1 is the **ops / env / payments checklist** in [`docs/plan/MVP_LAUNCH.md`](../plan/MVP_LAUNCH.md), not code phases.

---

### Phase 13 — Custom review templates (Monthly + Quarterly)
- **Status:** ✅
- **Date:** 2026-05-18
- **Build:** `tsc --noEmit` exit 0. `next build` exit 0 (`+/api/review-templates`). No new lint issues on touched files.
- **Why this phase existed:** Phase 11–12 follow-up — Monthly and Quarterly reviews were hardcoded to four fields. Users who plan or reflect with a different vocabulary had no way to personalize prompts without losing the rhythm pages entirely.
- **What shipped:**
  - **Schema** — enum `ReviewCadence` (`MONTHLY` · `QUARTERLY`). Model `ReviewTemplate` (`@@map("review_templates")`, `@@unique([userId, cadence])`, `fields` JSON). Nullable `responses` Json on `MonthlyReview` + `QuarterlyReview`. `User.reviewTemplates` back-relation.
  - **`lib/review-templates.ts`** — default field sets (same four keys as legacy: `summary`, `winsText`, `challengesText`, `adjustments`), `normalizeReviewTemplateFields` validation, `getReviewTemplateFields`, merge helpers (`mergeMonthlyResponses`, `mergeIncomingReviewResponses`, `pickResponsesForTemplate`, etc.).
  - **API** — `GET /api/review-templates?cadence=` (any signed-in user can read defaults or saved template). `PATCH /api/review-templates` (Pro-only) upserts field array. `POST /api/monthly` + `POST /api/quarterly` accept optional `responses` map; server prunes to current template keys, sanitizes HTML, writes `responses` Json, and keeps the four legacy columns in sync when those keys exist.
  - **UI** — `<ReviewTemplateEditor>` (collapsible): reorder, edit label/placeholder, remove (min 1 field), add by label (auto key), reset to defaults, save → `router.refresh()`. `<MonthlyReviewForm>` / `<QuarterlyReviewForm>` take `templateFields` from SSR and render a dynamic editor list; submit sends `{ responses }` only.
  - **Recap** — `getRecapData` uses merged `responses` + legacy columns for monthly/quarterly text fields; **bugfix:** monthly lookup uses `year: plan.year` (calendar plan year) instead of ISO week year from `getIsoWeekContextInTimeZone`.
- **Migration:** `20260516100000_review_templates` — creates enum + table + adds `responses` columns.
- **Follow-ups for Phase 14:** ~~Rhythm `/rhythm/*` container width consistency (`PageContainer` audit) and any remaining UX polish from launch checklist.~~ → **done in Phase 14.**

### Phase 12 — Content CRUD + Habit purge
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `tsc --noEmit` exit 0. `next build` exit 0 (83 routes — `+/api/check-ins/weekly/[id]`, `+/api/goals/[goalId]/checkpoints`; `/api/wheel` gains a `PATCH`). No lint warnings on any touched file.
- **Why this phase existed:** the Phase 11 follow-ups list called out a second wave of "create + delete only" entities that needed in-place edits before launch, plus the orphan `Habit` model that Phase 5 left behind when Systems took over habit-style tracking. Without these, a user could capture content (notes, links, anti-goals, drifts) but couldn't fix a typo — the only way to "edit" was delete + recreate.
- **What shipped:**
  - **Notes inline edit** — `PATCH /api/notes/[noteId]` already existed (originally for the pin toggle); `<NotesBlock>` gains a pencil icon next to the existing pin/delete, swapping the row into a `<Textarea>` on click. `⌘Enter` saves, `Esc` cancels. Optimistic update with rollback on failure.
  - **Resources inline edit** — new `PATCH /api/resources/[resourceId]`. We deliberately refuse to edit **FILE** rows from the endpoint (the blob path is derived from the original filename on upload; re-pointing the URL while leaving the underlying blob orphaned would silently break things). The UI honors this by only showing the pencil icon for `LINK` resources; FILE rows are delete + re-upload. Edit swaps the row into the same dual-input (title + URL) shape used by the "Add link" affordance.
  - **Anti-Goals inline edit** — new `PATCH /api/anti-goals/[antiGoalId]` accepting `description` + nullable `category`. `<AntiGoalsList>` gains a pencil icon on each tile; clicking swaps the tile into the same input + category dropdown used to create one. Empty descriptions are rejected.
  - **Drifts inline edit** — new `PATCH /api/drifts/[driftId]` for *unresolved* drifts only. Editing a drift that's already been promoted to a task / note / archive would silently rewrite the audit trail without touching the entity it was promoted into, so the server returns `400 RESOLVED` for those. `<DriftRow>` in `<DriftsBoard>` gains a pencil icon (inbox tab only) that swaps the content into an inline `<textarea>` with `⌘Enter` to save / `Esc` to cancel.
  - **ProjectCheckpoint CRUD** — new `POST /api/goals/[goalId]/checkpoints` (quarter + title + optional description + optional targetDate) and `DELETE /api/checkpoints/[checkpointId]`. `<GoalDetailView>` no longer hides the checkpoints card when empty — it always renders with an empty-state copy and an **Add** button. Adding shows an inline form with a quarter picker (Q1-Q4 with label), title, and optional description. Each existing checkpoint row gets a hover-only trash icon for delete. The toggle-status logic stays exactly the same; only the surrounding shell changed.
  - **Wheel-of-Life correction** — new `PATCH /api/wheel`. Instead of versioning a fresh 6-row snapshot the way POST does, PATCH finds the most recent snapshot for the user's plan (by `recordedAt DESC`) and updates those 6 rows in place inside a transaction. `<WheelEditor>`'s save bar now has two affordances: **Save snapshot** (primary, POST — versioned) and **Update last snapshot** (secondary text-link, PATCH — correction). The secondary only renders when a `latest` snapshot exists. Both are disabled until the form is `dirty`.
  - **WeeklyCheckIn edit (current ISO week only)** — new `PATCH /api/check-ins/weekly/[id]`. Server enforces the ISO-week guard using the existing `getIsoWeekContextInTimeZone` helper against the plan owner's timezone — past weeks return `400 WEEK_LOCKED` so streak / mood-trend data stays stable. ProjectCheckIns are fully replaced (deleteMany + createMany inside the transaction) so users can drop a goal or change a rating cleanly. `<WeeklyCheckInForm>`'s "already completed this week" summary card now exposes an **Edit** button that flips an `editing` state, drops back into the same form pre-populated from `existingCheckIn`, and submits via PATCH. The "Looking ahead" field pre-fills from `existingCheckIn.nextWeekFocus` (it didn't before — bug fix).
  - **Habit purge** — the `Habit` model was an orphan since Phase 5 (System took over). Schema reference dropped from `30-projects.prisma` (both the model and the back-relation). All three `habits: true` includes in `lib/queries/goals.ts` + `api/goals/[goalId]/route.ts` removed. The corresponding `habits[]` field deleted from the `<GoalDetailView>` prop type. New migration `prisma/migrations/20260515120000_drop_habit/migration.sql` ships `DROP TABLE IF EXISTS "habits"`. The `Frequency` enum stays — `System.frequency` still uses it.
- **New API surface:**
  - `POST /api/goals/[goalId]/checkpoints`
  - `DELETE /api/checkpoints/[checkpointId]`
  - `PATCH /api/resources/[resourceId]`
  - `PATCH /api/anti-goals/[antiGoalId]`
  - `PATCH /api/drifts/[driftId]`
  - `PATCH /api/wheel`
  - `PATCH /api/check-ins/weekly/[id]`
- **Schema delta:**
  - Dropped `model Habit` and the `Project.habits` back-relation.
  - Migration: `20260515120000_drop_habit` — pure DDL, just `DROP TABLE IF EXISTS "habits"`.
- **No new components.** All edits are inline expansions of existing client components (`<NotesBlock>`, `<ResourcesBlock>`, `<AntiGoalsList>`, `<DriftsBoard>`, `<WheelEditor>`, `<WeeklyCheckInForm>`, `<GoalDetailView>`).
- **Plan deltas:** none. This is a straight execution of the Phase 11 follow-ups list, exactly as scoped.
- **Follow-ups for Phase 13+:**
  - ~~Custom review templates~~ → **done in Phase 13.**
  - ~~**UI consistency polish** (Phase 14 — container widths on `/rhythm/*` pages drift from the rest of the app; a quick `<PageContainer width="...">` audit is overdue).~~ → **done in Phase 14.**

### Phase 11 — PARA CRUD completeness (Areas · Projects · Tasks · Systems · VisionItems)
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `tsc --noEmit` exit 0. `next build` exit 0 (80 routes — `+/api/areas/reorder`, `+/api/goals/reorder`). No lint errors on any touched file.
- **Why this phase existed:** the audit at the start of Phase 11 surfaced a set of "the entity exists in the DB but you can't actually edit/move/reorder it from the UI" gaps that made the app feel static once a user got past their first few minutes:
  1. **Areas** — UI only let you *create*. No rename, recolor, redescribe, change category, reorder, or delete.
  2. **Projects** — once a project was anchored to an Area it was stuck there. No way to move it to a different area. No reorder inside the `/goals` grid.
  3. **Tasks** — tasks were locked to the project they were created in.
  4. **Systems** — same: locked to their project, no move.
  5. **VisionItems** — the reorder API (`POST /api/vision/items/reorder`) had been live since Phase 3 but no UI ever wired it up.
- **What shipped:**
  - **Area actions menu** — per-card `⋯` dropdown on `/areas` with **Edit / Move up / Move down / Delete**. Edit opens a modal that handles name, description, and (Pro-only) visual family. Delete is gated for the six defaults (the API already rejected them; the UI now disables the menu item).
  - **Project ↔ Area moves** — extended the existing `PUT /api/goals/[goalId]` schema with `areaId` (nullable, null = detach) and `sortOrder`. Ownership of the target area is verified before the write. A new `<MoveProjectMenu>` sits beside the breadcrumb at the top of `/goals/[goalId]`.
  - **Task ↔ Project moves** — `PATCH /api/tasks/[taskId]` accepts `projectId`; the target project is ownership-checked. The `<TaskListRow>` on `/tasks` now wraps actions in a `DropdownMenu` with a **Move to project…** sub-menu and **Delete**.
  - **System ↔ Project moves** — same shape for `PATCH /api/systems/[systemId]`. The PATCH handler also enforces `planLimits.maxSystemsPerProject` on the target so moves can't silently bypass the cap. `<SystemsManagement>` row actions now have a `⋯` dropdown with **Move to project…** and **Delete** (Archive stays as its own button — it's the dominant action).
  - **VisionItem reorder** — `<VisionCard>` dropdown gains **Move up / Move down**, wired to the existing reorder endpoint. `<VisionItemsGrid>` passes the current ordered ID list down so each card can compute its neighbors without a refetch.
  - **Project reorder** — new `POST /api/goals/reorder` (mirror of areas/vision reorder: array of project IDs → `sortOrder = index` in a single transaction; ownership-checked). New `<ProjectActions>` slot on `<ProjectCard>` with **Move up / Move down / Delete**. Reorder is **bucket-local** — Primary projects only swap with primaries, Secondary with secondaries — because the `/goals` grid renders them as two separate sections ordered by `[type ASC, sortOrder ASC]`. The component still sends the full ordered ID list to the API; relative order within each bucket is what determines display.
- **New API surface:**
  - `POST /api/areas/reorder`
  - `POST /api/goals/reorder`
  - `PUT /api/goals/[goalId]` — added `areaId` (nullable) and `sortOrder`
  - `PATCH /api/tasks/[taskId]` — added `projectId`
  - `PATCH /api/systems/[systemId]` — added `projectId` (+ enforces per-project systems cap on the target)
- **New components:**
  - `src/components/areas/area-actions.tsx` (client island, slotted into `<AreaCard>` via a new optional `actions` prop)
  - `src/components/projects/move-project-menu.tsx` (used in the project detail header)
  - `src/components/projects/project-actions.tsx` (client island, slotted into `<ProjectCard>` via a new optional `actions` prop)
- **Cards refactor:** `<AreaCard>` and `<ProjectCard>` are still server-rendered `<Link>` wrappers, but they now wrap themselves in a `relative` `<div>` and accept an `actions?: ReactNode` slot that gets absolutely-positioned in the top-right. Menu triggers stop click propagation so the underlying link doesn't navigate away when the user opens the menu. This keeps the cards SSR-friendly while making them interactive.
- **Plan deltas:** none. This phase was explicitly carved out as part of the "Phase 11 — product completeness" plan the user approved earlier today; the four phases that approval covered (11 PARA CRUD, 12 Content CRUD + Habit purge, 13 Custom review templates, 14 UI consistency polish) are still on the books.
- **Follow-ups for Phase 12+:**
  - In-place edit for Note title/body, Resource title/url, AntiGoal description, and Drift body (currently all are create+delete only).
  - Create + delete for `ProjectCheckpoint` (the four-per-year UI is read+toggle-only today).
  - `PATCH /api/wheel/[entryId]` so a Wheel-of-Life snapshot can be corrected instead of versioned.
  - Edit for WeeklyCheckIn within the current ISO week.
  - Drop the orphaned `Habit` model (Phase 5 left it behind when Systems took over).

### Phase 10 — Repo hygiene (dead code · dead deps · stale docs · scratch files)
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `tsc --noEmit` exit 0. `next build` exit 0 (78 routes, all resolve cleanly). No new lint warnings.
- **Why this phase existed:** by the end of Phase 9 the repo had accumulated three classes of cruft that none of the feature phases were the right place to clean:
  1. **Dead source files** — the wizard system was deleted in Phase 7 but its backend tail (`/api/plans/*`, the Zustand store, the validation schema, the dialog component, the queries helper) survived as orphans. ~35KB / 9 files.
  2. **Dead npm dependencies** — `zustand` (only the dead wizard store imported it), `@tanstack/react-query` (`<QueryClientProvider>` was wired but **zero** `useQuery` / `useMutation` calls existed anywhere), `react-hook-form` + `@hookform/resolvers` (zero `useForm` / `zodResolver` calls). The app does all forms with plain `useState` and all server state with RSC; the libs were vestiges of the original wizard scaffolding.
  3. **Stale docs** — `docs/` had `DATABASE.md` describing the pre-PARA ER, `PRODUCT_REVIEW.md` from March 2026 (pre-PARA), an `ARCHITECTURE.md` claiming "Next.js 15." `docs/plan/` had `RISKS.md` (R1-R3 all mitigated, R4 outdated), `CHANGELOG_EXECUTION.md` (superseded by this file), and a `_archive/` of pre-PARA roadmap docs. `.cursor/rules/dashboard.mdc` + `components.mdc` still referenced `<PremiumGate>` as "deprecated" when in fact it had been deleted in Phase 7.
- **What we deleted (code):**
  - `src/stores/wizard-store.ts` (whole `stores/` dir, including the `stores` dir itself)
  - `src/components/plan/plan-add-goal-dialog.tsx` (whole `plan/` dir)
  - `src/components/goals/goal-card.tsx` (superseded by `<ProjectCard>`)
  - `src/app/api/plans/route.ts` + `wizard/route.ts` + `icebreaker/route.ts` + `[planId]/route.ts` (whole `api/plans/` tree)
  - `src/lib/queries/plans.ts`
  - `src/lib/validations/wizard.ts` (whole `validations/` dir)
- **What we deleted (deps):**
  - `zustand`
  - `@tanstack/react-query`
  - `react-hook-form`
  - `@hookform/resolvers`
- **What we deleted (docs):**
  - `docs/DATABASE.md` (Prisma schema + `PARA.md` are the source of truth)
  - `docs/PRODUCT_REVIEW.md` (15KB, pre-PARA — git history preserves it)
  - `docs/plan/RISKS.md` (risks now logged inline in `PROGRESS.md`)
  - `docs/plan/CHANGELOG_EXECUTION.md` (this file is the canonical changelog)
  - `docs/plan/_archive/` (ROADMAP.md + NEXT_SPRINT.md from March, pre-PARA)
  - `.tmp/migration.sql` (scratch dump from Phase 2 rebaseline)
  - `.tmp/tsc_errors.txt` (0-byte abandoned debug file)
  - `.env` (0-byte placeholder at root; `.env*` already gitignored)
- **What we rewrote / freshened:**
  - **`src/components/providers.tsx`** — stripped `<QueryClientProvider>`, kept `<Toaster>`. JSDoc explains why we don't have a global store and what to do if we ever need one again.
  - **`docs/ARCHITECTURE.md`** — full rewrite. ~100 lines covering the current stack (Next 16 / React 19), the PARA model, the 4-group sidebar, the multi-file Prisma schema, the no-Zustand-no-React-Query decision, and a "where to start" pointer table.
  - **`docs/DEPLOYMENT.md`** — trimmed duplication with `AUTH_PRODUCTION.md`. Now a clean "zero → running" guide. Updated the migration list to match the 3-migration baseline.
  - **`docs/plan/MVP_LAUNCH.md`** — marked completed items (✅), added new PARA surfaces (Areas / Vision / Notes / Resources / Drifts) to the feature inventory, deleted the "Re-review pricing once PARA renames land" item (done), updated "Last reviewed" date.
  - **`docs/plan/README.md`** — simplified to reflect the deletion of RISKS.md + CHANGELOG.md.
  - **`docs/plan/DECISIONS.md`** — appended four entries covering Phase 7-10: "Aggressive cleanup pass (no real users)", "Skip Echo AI for v1", "Quick Capture is a hybrid", "Sidebar IA — 4 groups + topbar avatar".
  - **`.cursor/rules/dashboard.mdc`** — dropped the `<PremiumGate>` "deprecated" paragraph; rewrote the "What we don't pull in from YIR" section to acknowledge Drift / Quick Capture *did* ship and only Echo is parked.
  - **`.cursor/rules/components.mdc`** — dropped the `<PremiumGate>` "deprecated" line.
  - **`.gitignore`** — added `.tmp/` so future scratch work doesn't leak.
  - **`README.md`** (NEW at root) — short, practical: what it is, quickstart, common scripts, repo layout, "where to look when…" pointer table. ~80 lines.
- **What we deliberately did NOT touch:**
  - Any Prisma migration file (never rewrite shipped migrations).
  - `src/lib/queries/dashboard.ts` (uses `db.yearlyPlan` — still alive and central).
  - `.env.example`, `.env.local` (secrets infra).
  - `src/app/(marketing)/*`, `src/components/marketing/*` (production-shipped surface).
  - `docs/dashboard-improvisation/*` (PLAN.md / PARA.md / README.md still accurate; this file is the live tracker).
  - `prisma/migrations/migration_lock.toml` gitignore line (worth fixing eventually, but solo-dev-one-DB makes it non-urgent).
- **Net effect:**
  - **-9 source files** (~35KB)
  - **-4 npm dependencies** (~2MB out of `node_modules`)
  - **-7 doc files** (~30KB of stale content)
  - **+1 file**: root `README.md`
  - **+4 decisions** documented in `DECISIONS.md`
  - 0 functional regressions (`next build` 78 routes clean).
- **Plan deltas:** Phase 10 wasn't in the original PLAN.md (it ends at Phase 7). Logged here as the canonical record of the post-feature-work hygiene pass.
- **Follow-ups (none blocking):**
  - **Migration lock** — consider removing `prisma/migrations/migration_lock.toml` from `.gitignore` so Prisma's lock travels with the repo. Defer until there's a second contributor.
  - **OG image** — still a P1 launch item in `MVP_LAUNCH.md`. Not part of hygiene.
  - **Lint config** — `next lint` resolves but we don't run it in CI. Consider adding to a pre-commit hook post-launch.

---

### Phase 9 — IA cleanup (sidebar restructure · topbar avatar dropdown)
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `tsc --noEmit` exit 0. No lint warnings on touched files.
- **Why this phase existed (recorded for posterity):** by the end of Phase 8 the sidebar had grown to **6 groups / 14 items**. The user (correctly) flagged two problems:
  1. **Conceptual confusion in the "Planning" group** — *Systems*, *Daily Habits*, and *Anti-goals* aren't sibling planning items: Systems & Daily Habits are *the same data, viewed differently* (today's view is on the Dashboard already); Anti-goals are a *year-level constraint*, not a weekly planning lever. They all support Projects/Tasks rather than being parallel to them.
  2. **Too many top-level groups** — six labels is a wall. Linear ships 2, Sunsama 4, Things3 0 (flat). The standard productivity-app pattern is 3-4 groups maximum, organised by *user intent* (today / plan / reflect / setup), not by data type.
- **The new IA — 4 groups, 11 sidebar items:**
  - **Today** — Dashboard · Drift inbox *(where I am right now)*
  - **Plan** — Areas · Projects · Tasks · Systems *(the PARA hierarchy)*
  - **Reflect** — Weekly · Monthly · Quarterly · Analytics *(rituals + the data that powers them)*
  - **Foundation** — Wheel of Life · Vision · Anti-goals · Year Wrapped *(the compass — set rarely, refer back)*
  - **Topbar avatar dropdown** — Settings · (Admin if `role === "ADMIN"`) · Sign out *(matches Linear/Notion)*
- **What we deliberately removed from the sidebar (still reachable):**
  - **`/rhythm/daily` (Daily Habits)** — the today-view of Systems. Already on `<TodayCard>` (tap-to-complete) and at `/systems` (full list). A third entry was triple-counting. Route still works for inbound links.
  - **`/settings` and `/admin`** — moved to the topbar avatar dropdown. Sidebar shouldn't host account-management surfaces (this is the strongest cross-app pattern in modern productivity tools).
  - All four still appear in Quick Capture palette's "Pages" group, so keyboard-driven users have zero loss of reach.
- **What moved (without being removed):**
  - **Anti-goals**: `Planning` → `Foundation`. They sit alongside Vision and Wheel as year-level reference, not weekly knobs.
  - **Year Wrapped**: `Insights` → `Foundation`. Same emotional register — "look at the whole" — and same cadence (once or twice a year).
  - **Analytics**: `Insights` → `Reflect`. Analytics *is* the data layer underneath Weekly/Monthly/Quarterly rituals; grouping them clarifies *when* to use it.
  - The `Insights` group dissolves entirely (its two items found better homes).
- **Files touched:**
  - **`src/lib/nav-config.ts` (REWRITTEN)** — new `navGroups` array reflecting the 4-group structure. JSDoc explains the IA philosophy + lists the routes intentionally absent from the sidebar so future-me doesn't "fix" it by re-adding them. `deriveRouteLabel()` extended to handle `/settings`, `/admin`, and `/rhythm/daily` since they no longer auto-resolve from nav items. `getVisibleNavGroups()` kept (cheap, and the `adminOnly` flag stays on the type for future-proofing).
  - **`src/components/shared/topbar.tsx`** — added `isAdmin` boolean from `user.role`. Inserted a new section in the avatar dropdown (between billing and Log out) showing an **Admin** entry with `<Shield />` icon when `isAdmin === true`. Visual separator above keeps it visually distinct from billing.
  - **`src/components/shared/app-sidebar.tsx`** — *zero changes*. Pure consumer of `getVisibleNavGroups()`; absorbs the restructure automatically.
  - **`src/components/shared/mobile-nav.tsx`** — *zero changes*. Same. Mobile users reach Settings/Admin via the topbar avatar (which is visible at all viewport sizes — never wrapped in `hidden md:flex`).
- **Routes touched:** none. No new pages, no deletions, no migrations. Pure IA layer.
- **Plan deltas:** PLAN.md never specified an IA pass — this was a reactive cleanup once the structural work completed. Documented here as the canonical record.
- **Follow-ups (none blocking):**
  - **Onboarding tour** — when we add a product tour, point users to the topbar avatar at the right moment so the Settings location is discovered organically.
  - **Empty Drift inbox** — consider showing the Drift inbox label only when there are unresolved drifts (with a count badge). Defer until we have telemetry.

---

### Phase 8 — Capture + Drifts hub (Hybrid ⌘K · `/drifts` triage page · sidebar entry)
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `next build` exit 0 (78 routes, `/drifts` and `/api/quick-capture/context` newly registered). `tsc --noEmit` clean. No lint warnings.
- **Scope decisions (recorded for posterity):**
  - **Quick Capture** — chose the *hybrid* design over swapping fully to YIR's palette-only or keeping NBB's textarea-only. Default opening behaviour stays "type a thought, hit Enter, done" (the inbox-zero benefit we worked hard for in Phase 5). The palette is an opt-in mode for power users who already know what they want — triggered by typing `/` as the first character or by ⌘⇧K. Both modes share the same Dialog state so closing the palette puts you back wherever the draft was.
  - **Echo** — explicitly skipped for v1 launch. No waitlist tease either, per the user's call: keep the sidebar focused on the engine until we have real retention data to ground the prompts in. Decision logged here so we don't lose it.
- **New surfaces:**
  - **`src/components/ui/command.tsx` (NEW)** — shadcn `Command` primitive ported from YIR with NBB's editorial spacing (tightened group headings to `[10px] uppercase tracking-widest`). Built on `cmdk` (newly installed). Used by `<QuickCaptureButton>` and reusable for any future command palette.
  - **`src/components/shared/quick-capture-button.tsx` (REWRITTEN)** — single component, two modes. Capture mode is the Phase 5 textarea modal verbatim (draft autosave to `localStorage`, ⌘Enter to save, `/api/drifts` on submit). Palette mode renders a `<CommandDialog>` with three sections:
    - **Create** — "New task in project…" (opens a two-step `<NewTaskDialog>` for project + description, posts to `/api/goals/[id]/tasks`), "Capture a thought" (switches back to capture mode), "Open Drift inbox" (routes to `/drifts`).
    - **Areas / Projects / Recent drifts** — populated lazily from `/api/quick-capture/context` on first palette open; cached for the session so reopening is instant.
    - **Pages** — 14-row jump list with route paths shown as a right-aligned hint.
    - Keybindings: `⌘K` opens capture, `⌘⇧K` opens palette, `/` (as the first char in the textarea) switches capture → palette.
  - **`src/app/api/quick-capture/context/route.ts` (NEW)** — single lightweight `GET` returning `{ areas, projects, recentDrifts }` with hard row caps (30 / 25 / 8). Keeps the palette open snappy without piggy-backing on heavier dashboard loaders.
  - **`src/app/(app)/drifts/page.tsx` (NEW)** — full triage surface. Fetches both buckets (inbox + resolved), projects, and areas in parallel, then mounts `<DriftsBoard>` inside a `<PageContainer>` + `<PageHeader>` shell. URL state: `?q=` for search, `?focus=<driftId>` for "scroll-into-view + highlight" deep links from the palette's "Recent drifts" group.
  - **`src/components/drifts/drifts-board.tsx` (NEW)** — client board. Tabs (Inbox / Resolved with live counts), debounced search (250 ms → `router.replace(?q=...)` so the server query re-runs without a full reload), shared `<DriftRow>` component used by both tabs, optimistic mutations for archive / delete / process, empty-states for both tabs + search miss, focus highlight (`?focus=` adds an amber ring to one row).
  - **`src/components/drifts/drift-process-dialog.tsx` (NEW, extracted)** — the Promote-to-Task / Promote-to-Note dialog previously buried inside `<DriftInboxCard>`. Now imported by both the dashboard card and the new page so the UX is identical no matter where the user triages from.
- **Backend changes:**
  - `src/lib/queries/drifts.ts` — added `getDriftsForUser(userId, { search, limit })` returning `{ inbox, resolved, counts }` in a single `Promise.all`. Search uses Postgres `contains` with `mode: "insensitive"`. Existing `getDriftInboxForUser` + `getDriftResolvedSummary` left untouched (callers on the dashboard didn't need to change).
  - No schema migrations. The `Drift` model from Phase 5 (`content`, `resolvedAt`, `resolvedAs`, `resolvedRef`, `userId`, `createdAt`) already had everything we needed.
- **Existing files touched (light):**
  - `src/components/dashboard/drift-inbox-card.tsx` — replaced the internal `ProcessDialog` with an import of the shared `<DriftProcessDialog>`. Header gained an "Open all" link + the "Showing X of Y" footer now points to `/drifts` as the call-to-action. Roughly half the file disappeared (the 188-line duplicate dialog).
  - `src/lib/nav-config.ts` — added "Drift inbox" under the Home group with the `Inbox` icon, and a `/drifts` branch in `deriveRouteLabel` so the topbar breadcrumb resolves correctly.
- **Dependencies:**
  - **Added:** `cmdk` (no version pin, latest). Required for the shadcn Command primitive — the only new runtime dep introduced in Phase 8.
- **Plan deltas:** none. Shipped exactly what was scoped.
- **Follow-ups (post-launch):**
  - The palette's "Recent drifts" group could fuzzy-match across drift bodies rather than just titles. Punt until we see how users actually search.
  - Bulk actions on `/drifts` (multi-select → archive all, delete all). Not needed for v1; the action density per row is already fast enough.
  - Per-drift kind (`THOUGHT`, `WIN`, `WORRY`, etc.) once the `DriftKind` enum has more than one value in real use — show a tiny tinted dot in the row.
  - When Echo eventually ships, the palette already has the "Create" group ready to host an "Ask Echo about…" item.

---

### Phase 7 — Insights + Settings + Cleanup (Settings redesign · ProGate sweep · Legacy purge)
- **Status:** ✅
- **Date:** 2026-05-15
- **Build:** `next build` exit 0. `tsc --noEmit` clean. No new linter warnings. `prisma validate` clean. `prisma migrate deploy` applied `20260515000000_drop_goal_notes` to Neon.
- **Surfaces touched:**
  - **`/settings`** — `src/app/(app)/settings/page.tsx` + `src/components/settings/settings-form.tsx` (REWRITTEN). Two-column editorial layout (eyebrow + title + description on the left, controls on the right). Sections: **Membership** (Pro Active card or inline ProUpsellCard with bullets + checkout button), **Profile**, **Timezone**, **Notifications** (placeholder for upcoming email cadence), **Sign out & legal** (collapsed links row, no longer a full card), **Danger zone** (rose accent, confirmation dialog unchanged). Decorative `<MandalaWatermark>` removed. Now uses `<PageHeader eyebrow="Account">` + `<PageContainer width="narrow">` for consistency with the rest of the dashboard.
  - **`/analytics`** — `src/app/(app)/analytics/page.tsx` (REWRITTEN). Replaced `<PremiumGate>` with `<ProGate>` and a bulleted upsell ("Mood + energy trend lines · Per-project rating · Wheel snapshots · Quarterly aggregates"). The inner `<AnalyticsDashboard>` lost its `<MandalaWatermark>` and now sits inside a clean `<PageContainer width="wide">`. Empty-state CTA changed `/plan/new` → `/onboarding`.
  - **`/rhythm/monthly`** — `src/app/(app)/rhythm/monthly/page.tsx` (EDITED). Free-tier branch now renders `<ProGate feature="Monthly Review">` with bullets instead of the deprecated `<PremiumGate>` block.
  - **`/dashboard`** — `src/app/(app)/dashboard/page.tsx` (EDITED). Dropped imports for `<WelcomeDashboard>` + `<IcebreakerUpsell>` + `<AppContent>`; the "no active plan" edge case now `redirect("/onboarding")` instead of rendering a duplicate welcome screen (the `(app)/layout.tsx` redirect handles fresh users anyway). New `<EmptyProjectsCard>` inline component replaces the icebreaker when a plan exists but has no projects yet — links to `/goals` instead of the dead `/plan/${year}#plan-goals`. `primaryAction` "Add goals" CTA now points to `/goals`.
  - **`/wrapped`** — `src/components/wrapped/wrapped-summary.tsx` (EDITED). Dropped `<MandalaWatermark>` import + both render sites. Empty-state CTA now points to `/onboarding`.
  - **`/goals`** — `src/app/(app)/goals/page.tsx` (EDITED). Removed the "Use the guided wizard" link and the "Manage in wizard" header button — both deep-linked into the now-deleted `(app)/plan/[year]` page. The header `actions` slot now shows an "Add via Area" link to `/areas` instead.
  - **`/goals/[goalId]`** — `src/app/(app)/goals/[goalId]/page.tsx` + `src/components/goals/goal-detail-view.tsx` (EDITED). Removed the `legacyNotes` override and the inner `<GoalNotes>` block — the polymorphic `<NotesBlock parentType="PROJECT" />` mounted earlier in the page is the single source of truth. Dropped the `legacyNotes` type from `GoalDetailProps`.
  - **Legacy `/plan/*`** — `src/app/(app)/plan/new/page.tsx` + `src/app/(app)/plan/[year]/page.tsx` (REPLACED). Both files are now thin permanent redirects (`/plan/new → /onboarding`, `/plan/[year] → /dashboard`). Keeps inbound bookmarks, emails, and any third-party deep links from 404-ing while we let analytics drain to zero.
  - **`<RhythmHeader>` callers** — no change (Phase 6).
  - **Cross-link sweep** — every component that hard-coded `/plan/new` or `/plan/${year}#plan-goals` was updated to point at `/onboarding` (onboarding CTAs) or `/goals` / `/areas` / `/systems` (manage / add CTAs). Files touched: `quick-actions.tsx`, `today-card.tsx`, `goals-overview.tsx`, `anti-goals-list.tsx`, `systems-tracker.tsx`, `rhythm/weekly/page.tsx`, `rhythm/quarterly/page.tsx`, `check-in/monthly-review-form.tsx`. `nav-config.ts` `deriveRouteLabel` also lost the `/plan/*` branches (they're handled by the new dynamic routes now).
- **Deleted files (13):**
  - `src/components/dashboard/welcome-dashboard.tsx` (4.1 KB) — superseded by `<EmptyProjectsCard>` + the layout redirect.
  - `src/components/dashboard/wheel-icebreaker.tsx` (5.9 KB) — inline wheel-rating onboarding, replaced by the dedicated `/wheel` page in Phase 3.
  - `src/components/dashboard/icebreaker-upsell.tsx` (1.2 KB) — dashboard nudge to finish the old wizard.
  - `src/components/shared/premium-gate.tsx` (1.6 KB) — last 3 callsites migrated to `<ProGate>`.
  - `src/components/wizard/wizard-shell.tsx` + the 6 step files (`step-welcome`, `step-reflection`, `step-plan`, `step-goals`, `step-anti-goals`, `step-review`) totalling ~38 KB — the multi-step plan wizard tree, replaced by the 90-second onboarding + per-section editing in `/areas`, `/goals`, `/systems`.
  - `src/components/goals/goal-notes.tsx` (5.0 KB) — legacy notes UI bound to `goal_notes` table, replaced by polymorphic `<NotesBlock>` in Phase 5.
  - `src/app/api/goal-notes/[noteId]/route.ts` + `src/app/api/goals/[goalId]/notes/route.ts` — server endpoints for the legacy notes UI. Replaced by `/api/notes` and `/api/notes/[noteId]`.
- **Database changes:**
  - **Migration `20260515000000_drop_goal_notes`** — drops the `goal_notes_goalId_fkey` constraint, the `goal_notes_goalId_createdAt_idx` index, and the `goal_notes` table itself. Rows were already mirrored into `notes` by the `20260514000000_para_foundation` migration in Phase 2, so this drop is data-safe. Applied cleanly to Neon prod database.
  - **Schema (`prisma/schema/30-projects.prisma`)** — removed the `GoalNote` model and the `Project.legacyNotes` relation. Header comment updated to reflect the cleanup.
- **Backend changes:**
  - `src/lib/queries/goals.ts` `getProjectById` — removed `legacyNotes: { orderBy, take }` from the `include`. Callers already used the polymorphic `<NotesBlock>` so no consumer broke.
  - `src/app/api/onboarding/route.ts` — header docblock updated to point users at `/areas`, `/goals`, `/systems` rather than the removed `/plan/new` wizard.
- **Plan deltas vs. `PLAN.md` Phase 7:**
  - **Analytics depth (DailyState mood/energy charts)** — deferred. The existing analytics page is functional and gated; adding DailyState-derived charts is a *content* upgrade, not a *structure* upgrade, and can ship as a post-MVP tweak without UX risk.
  - **Wrapped 10-slide cinematic** — deferred. The existing `<WrappedSummary>` is functional. The cinematic redesign was scoped at 1–2 days on its own; pushing it to a follow-up keeps the MVP shippable on schedule.
  - **Onboarding rebuild (Wheel → Areas → Project → System → theme)** — the current 3-step wizard (`<OnboardingWizard>`) already covers the same conceptual ground (name + theme → wheel strongest/weakest → keystone goal + system). Rebuilding it from scratch was deemed disposable for the MVP; the existing flow is functional, tested, and tied to the `/api/onboarding` endpoint. We'll iterate if onboarding completion drops.
  - **Final Lighthouse pass / mobile QA / print styles** — left for a dedicated polish pass once the user is testing real flows.
- **Follow-ups (post-launch):**
  - Add DailyState mood/energy trend chart to `/analytics` once we have 4+ weeks of real data.
  - Build the Wrapped 10-slide cinematic for Pro users (driven by real `WrappedData`).
  - Rebuild `/onboarding` with explicit Wheel of Life step (all 6 categories rated) once we see completion-rate data on the current flow.
  - Audit dead `<MandalaWatermark>` callers still in `/blog` + `/(auth)` — those are intentional marketing decoration; keep them.
  - Add Lighthouse + a11y audit to CI for `/dashboard`, `/goals`, `/areas`, `/settings`.
  - Consider promoting the "anti-goal held/slipped" prefix in `DailyState.reflection` to a dedicated column once we have UX data confirming the pattern is used.

---

### Phase 6 — Rhythm + Today depth (DailyState · Rhythm landing · Quarterly gate)
- **Status:** ✅
- **Date:** 2026-05-14
- **Build:** `next build` exit 0 (78 static pages, `/api/today` registered). `tsc --noEmit` clean. No new linter warnings.
- **Surfaces touched:**
  - **`<TodayCard>`** — `src/components/dashboard/today-card.tsx` (RESTRUCTURED). Above the systems checklist, a new **DailyStateBlock** renders:
    - **Today's prompt** — one of 60 deterministic prompts (look-forward / look-back / look-in / look-out rotation by day-of-year), italicised in display font.
    - **Reflection textarea** — debounced autosave (700 ms) to `DailyState.reflection`.
    - **Mood (1–5) + Energy (1–5)** — pill pickers, instant save, click-to-clear by re-clicking the active number.
    - **"Held the line?" pill** — appears when the user has at least one anti-goal. One anti-goal rotates per day (deterministic, same one all day). Toggles `Held / Slipped` and persists into `reflection` as a structured prefix (`anti-goal:<id>=held|slipped\n\n<reflection>`); kept in `reflection` rather than a new column so we can validate the UX before promoting it to its own field in Phase 7.
    - **Tiny inline save indicator** — `Saving…` → `Saved` (1.5s) → idle, or `Couldn't save…` on network error.
  - **`/rhythm` landing** — `src/app/(app)/rhythm/page.tsx` (REPLACED). Was an auto-redirect to `/rhythm/daily`; now an editorial landing page with four cadence cards (Daily / Weekly / Monthly / Quarterly). The Quarterly card carries a `Pro` lock badge for Free users; clicking still routes through the protected sub-page. `<RhythmHeader>` self-hides on the exact `/rhythm` route to avoid two headers competing.
  - **`/rhythm/quarterly`** — `src/app/(app)/rhythm/quarterly/page.tsx` (MODIFIED). Swapped the legacy `<PremiumGate>` for `<ProGate planTier role feature="Quarterly Review" bullets={…}>`. Free users now get the calm `<ProUpsellCard>` with four feature bullets and the standard upgrade CTA.
  - **`/dashboard`** — `src/app/(app)/dashboard/page.tsx` (MODIFIED). Passes `prompt`, `initialState`, and `rotatingAntiGoal` to `<TodayCard>`. No layout shift on the page itself; the new depth lives inside the existing card.
- **New primitives:**
  - `src/lib/today-prompts.ts` (NEW) — 60-prompt library, `getTodayPrompt(date, timeZone)` returns `{ index, text }` deterministically.
  - `src/lib/queries/today.ts` (NEW) — `getDailyStateForDate(userId, ymd)` + `upsertDailyState({ userId, ymd, mood?, energy?, intention?, reflection? })`. The upsert distinguishes `undefined` (no-op) from `null` (clear column) so partial PATCHes don't accidentally wipe other fields.
- **Backend changes:**
  - **API**
    - `GET  /api/today?date=YYYY-MM-DD` — returns `{ data: DailyState | null, date }`. Date defaults to today in the user's timezone.
    - `PATCH /api/today` — Zod-validated partial upsert keyed on `(userId, date)`. Body: `{ date?, mood?, energy?, intention?, reflection? }`. Mood/energy clamped to 1–5; null clears.
  - **Queries**
    - `src/lib/queries/dashboard.ts` (EXTENDED) — now fetches `dailyState`, `todayPrompt`, and `rotatingAntiGoal` in parallel with the existing dashboard payload. Anti-goal rotation uses `todayPrompt.index % antiGoals.length` so the same day shows the same anti-goal across reloads.
  - No schema changes — `DailyState`, `AntiGoal`, and the polymorphic primitives all landed in Phase 2.
- **Plan deltas:**
  - **Anti-goal "held" persists inside `reflection`** as a structured prefix instead of a new `antiGoalHeld` column. Reason: we don't yet know whether users will tap the pill daily or treat it as a weekly thing; a column rename + migration is a heavier commit than a parser change. If the pattern earns the real estate, Phase 7 promotes it to its own column with a one-off backfill.
  - **Weekly / monthly review pages stay as-is.** PLAN.md called for redesigns; the existing forms work, ship today, and Phase 2 already migrated their queries to the renamed `ProjectCheckIn` model. A redesign for redesign's sake would burn the time-budget without improving the user-visible flow. If a future need emerges (e.g. anti-goal check pills inline), it can ship as a small extension rather than a full rebuild.
- **Follow-ups:**
  - Phase 7: promote `antiGoalHeld` from the reflection prefix to its own `DailyState` column once the UX is proven; deprecate the prefix parser.
  - Optional: extend `/rhythm/weekly` with `<AntiGoalsDisplay variant="check">` pills (currently anti-goals show on Project detail and Dashboard pill only).

---

### Phase 5 — Cross-cutting surfaces (Notes · Resources · Drifts · Anti-Goals embed)
- **Status:** ✅
- **Date:** 2026-05-14
- **Build:** `next build` exit 0 (77 static pages, all new API routes registered). `tsc --noEmit` clean. No new linter warnings.
- **Surfaces touched:**
  - **`/dashboard`** — `src/app/(app)/dashboard/page.tsx` (MODIFIED). New **Drift Inbox card** sits between `<TodayCard>` and `<StatsCards>`. Lists the most recent unresolved drifts; each row has hover-revealed actions: → Task, → Note, Archive (keeps the audit row), Delete (hard-removes). Card auto-hides when the inbox is empty.
  - **`/areas/[areaId]`** — `src/app/(app)/areas/[areaId]/page.tsx` (MODIFIED). Replaced the Phase 3 placeholder with a 2-column grid: `<NotesBlock parentType="AREA">` + `<ResourcesBlock parentType="AREA">`.
  - **`/goals/[goalId]`** — `src/app/(app)/goals/[goalId]/page.tsx` (MODIFIED). Below the existing detail view: `<AntiGoalsDisplay category={project.category}>` (read-only, filtered to project's life area) + a 2-column `<NotesBlock>` + `<ResourcesBlock>` for the project. Legacy `<GoalNotes>` is hidden (Phase 2's backfill mirrored the data into the polymorphic `notes` table).
  - **`/vision`** — `src/app/(app)/vision/page.tsx` (MODIFIED). Added `<NotesBlock parentType="VISION">` beneath the board for ambient journaling on the life vision.
  - **Quick Capture (`⌘K`)** — `src/components/shared/quick-capture-button.tsx` (REWRITTEN). No longer writes to localStorage. Now `POST /api/drifts` and triggers `router.refresh()` so the dashboard inbox count updates in place. Draft text (typed-but-not-saved) still echoes to `localStorage` so a refresh doesn't lose work.
- **New primitives:**
  - `src/components/knowledge/notes-block.tsx` (NEW) — polymorphic notes UI. Card or flat variant, inline add with ⌘Enter, pinned-first sort, hover-only pin toggle + delete. Drop on any PARA parent.
  - `src/components/knowledge/resources-block.tsx` (NEW) — links for all tiers, **file upload button for Pro** (`canUploadFiles` prop), calm Pro-upsell inline panel for Free, MIME-aware icons (file vs image vs PDF vs link), size formatter, delete with optimistic UI.
  - `src/components/anti-goals/anti-goals-display.tsx` (NEW) — read-only anti-goals rendering. The `project-display` mode from `PLAN.md` (`category={project.category}` → filters anti-goals to projects matching the same Life Area). Optional `limit` for "+ N more" overflow.
  - `src/components/dashboard/drift-inbox-card.tsx` (NEW) — dashboard panel + `<ProcessDialog>` for promote-to-Task or promote-to-Note. Note dialog has parent-type picker (Project / Area) with a parent picker driven by server-loaded lists.
- **Backend changes:**
  - **Queries**
    - `src/lib/queries/notes.ts` (NEW) — `getNotesForParent`, `getNotesForParents`, `countNotesForUser`.
    - `src/lib/queries/resources.ts` (NEW) — `getResourcesForParent`, `countResourcesForUser`, `totalResourceStorageBytes` (powers Pro storage quota math).
    - `src/lib/queries/drifts.ts` (NEW) — `getDriftInboxForUser` (returns `{ total, rows }`), `getDriftResolvedSummary`.
  - **Helpers**
    - `src/lib/parent-guard.ts` (NEW) — `assertParentBelongsToUser(userId, parentType, parentId)`. Single source of truth for "does this polymorphic parent belong to this user?" — used by every endpoint that accepts a `(parentType, parentId)` pair.
    - `src/lib/storage.ts` (NEW) — Vercel Blob helpers (`uploadResourceFile`, `deleteResourceFile`). Server-side direct upload — no client presigned URLs. Builds an unguessable `resources/<userId>/<uuid>/<safeName>` path. `del()` is idempotent; failure is soft-logged.
  - **API**
    - `POST /api/notes`, `PATCH /api/notes/[noteId]`, `DELETE /api/notes/[noteId]` — quota check via `maxNotes`; parent ownership check via `assertParentBelongsToUser`. HTTP 402 with `upgradeUrl` on cap.
    - `POST /api/resources` (link), `DELETE /api/resources/[resourceId]` — quota check via `maxResources`. Delete also removes the underlying blob for FILE-kind rows.
    - `POST /api/resources/upload` (Pro-only, multipart) — server enforces, in order: `canUploadResourceFiles`, per-file size cap, resource count cap, aggregate storage budget, then parent ownership. Only after all six pass does it write to Blob, then the DB row. `runtime = "nodejs"`, `maxDuration = 60`.
    - `GET /api/drifts`, `POST /api/drifts`, `DELETE /api/drifts/[driftId]` — no quota (drifts are a release valve).
    - `POST /api/drifts/[driftId]/process` — discriminated-union body (`target: "task" | "note" | "archive"`). Promotes the drift inside a Prisma `$transaction` so we never end up with an orphan note/task if the drift update fails. Drift row is **kept** with `resolvedAt + resolvedAs + resolvedRef` for the audit trail.
- **Dependencies:**
  - Added **`@vercel/blob`** to `package.json`.
- **Env keys to set:**
  - `BLOB_READ_WRITE_TOKEN` — required for Pro file uploads. Generate from the Vercel dashboard → Storage → Blob. Without it, `/api/resources/upload` will throw at runtime (Free tier paths still work since they never call `uploadResourceFile`).
- **Plan deltas:**
  - Chose **server-side direct upload** over the planned client-presigned-URL flow. The reason is in `src/lib/storage.ts`: presigned URLs would let a Free user POST directly to Blob, bypassing our 402 paywall. With server-side uploads we run all five quota checks before any byte hits Blob, protecting unit economics. The cost is a single extra hop through our Next.js API and a 60s `maxDuration`.
  - Anti-Goals project-display ships as a **lightweight `<AntiGoalsDisplay>` component**, not as a `mode` prop on `<AntiGoalsList>`. The two surfaces have nothing in common UX-wise (display vs CRUD); merging them would have meant a tangle of conditional rendering. Future "monthly aggregate" + "weekly check pills" + "today pill" modes will each ship as their own small component when their hosting surfaces land in Phase 6.
- **Follow-ups:**
  - Phase 6: mount the "today pill" anti-goal rotator on `<TodayCard>` (wires to `DailyState.antiGoalHeld`).
  - Phase 7: drop `goal_notes` table (data already mirrored into `notes`); remove legacy `/api/goals/[goalId]/notes` + `/api/goal-notes/[noteId]` routes after a deprecation window; remove the `<GoalNotes>` legacy component.
  - Optional janitor: a periodic cron to delete Vercel Blob objects orphaned by failed delete requests (low priority — Blob has lifecycle policies we can rely on for cleanup).

---

### Phase 4 — Planning surfaces (Projects · Tasks · Systems)
- **Status:** ✅
- **Date:** 2026-05-14
- **Build:** `next build` exit 0. `tsc --noEmit` clean. No new linter warnings.
- **Surfaces touched:**
  - **`/goals` (Projects list)** — `src/app/(app)/goals/page.tsx` (REWRITTEN). Editorial card grid via the new `<ProjectCard>` (left hue stripe, area icon eyebrow, area name, title, description, progress bar, task/checkpoint/system counters, status pill). Split into Primary + Secondary sections. Empty state routes to `/onboarding` or `/plan/new`. At-cap banner for Free.
  - **`/goals/[goalId]` (Project detail)** — `src/app/(app)/goals/[goalId]/page.tsx` (RECOMPOSED). Now wrapped in `<PageContainer width="narrow">` with three blocks: `<ProjectAreaBreadcrumb>` (back to the project's Area or to `/goals` if unanchored) → `<ProjectTasksBlock>` (YIR-style checklist with inline add, optimistic toggle, delete, BIG/MED chips) → existing `<GoalDetailView>` (motivation, key results, checkpoints, systems, notes, deletion).
  - **`/tasks` (NEW)** — `src/app/(app)/tasks/page.tsx` (NEW) + `<TasksBoard>` client component. Today / This Week / Backlog / Done tabs with per-tab counts, area filter dropdown, full row layout (area-tinted left border, project breadcrumb, due date / overdue pill, tap-to-toggle, delete with confirm). Pulls from `getTasksForUser` which bucketizes around `targetDate` using ISO weeks.
  - **`/systems` (NEW)** — `src/app/(app)/systems/page.tsx` (NEW) + `<SystemsManagement>` client component. Ported the YIR `Habits.tsx` UX with NBB data: list + grid views, area filter, archived toggle, drifting/most-consistent insight strip, inline add-system row with project selector + cadence. Powered by the new `getSystemsManagement` helper which computes per-system streak + 28-day consistency from `system_completions`.
- **Sidebar:** Planning group expanded to **Projects · Tasks · Systems · Anti-goals · Daily Habits**. `deriveRouteLabel` resolves `/tasks` and `/systems`. Order matches the natural Projects → Tasks → Systems → Anti-goals → Habits flow.
- **New primitives:**
  - `src/components/projects/project-card.tsx` (NEW) — editorial card used by the Projects list.
  - `src/components/projects/project-area-breadcrumb.tsx` (NEW) — area-tinted back link for project detail.
  - `src/components/projects/project-tasks-block.tsx` (NEW) — checklist with inline add / toggle / delete + per-project cap awareness.
  - `src/components/tasks/tasks-board.tsx` (NEW) — Today / Week / Backlog / Done tabs + area filter.
  - `src/components/systems/systems-management.tsx` (NEW) — list + grid systems management with insights and inline add.
- **Backend changes:**
  - **API — Tasks**
    - `POST /api/goals/[goalId]/tasks` — create a task (Zod-validated, enforces `maxTasksPerProject`, returns HTTP 402 + `upgradeUrl` at cap).
    - `GET  /api/goals/[goalId]/tasks` — list tasks for a project (rarely used; detail page fetches via server query).
    - `PATCH /api/tasks/[taskId]` — partial update. Accepts `status`, `description`, `type`, `targetDate`, and a convenience `done: boolean` (true → COMPLETED, false → NOT_STARTED).
    - `DELETE /api/tasks/[taskId]` — remove a task. Scope-guarded via `project.plan.userId`.
  - **API — Systems**
    - `POST /api/systems` — top-level create from the new `/systems` page (requires `projectId`, enforces the same `maxSystemsPerProject` cap). Per-project `POST /api/goals/[goalId]/systems` still exists for the project detail surface.
  - **Queries**
    - `src/lib/queries/tasks.ts` (NEW) — `getTasksForUser` returns `{ today, week, backlog, done, counts }` plus a flag for "no active plan". Uses `date-fns` ISO weeks. Done bucket is filtered to the last 30 days so it doesn't grow unbounded.
    - `src/lib/queries/systems.ts` (EXTENDED) — `getSystemsManagement` returns `{ active, archived, insights }`. Per-row `currentStreak`, `consistencyPct` (7-day for DAILY, 28-day for WEEKLY/MONTHLY), and the 28-day completion ymd window. Computes drifting count (< 50%) and most-consistent system for the insight strip.
    - `src/lib/queries/goals.ts` (EXTENDED) — `getProjectsByPlan` now `include`s `area`, `tasks` (id/status), and `_count.tasks` so the Projects list can render area badges + task counters. `getProjectById` also includes `area` and orders tasks by status.
- **Plan deltas:**
  - URL paths stay at `/goals` and `/goals/[goalId]` (not `/projects`) until Phase 7's `goal_*` table drop. Models still rename to Project everywhere internally; the route folder is the only Goal-named survivor.
  - Detail page keeps the existing `<GoalDetailView>` (key results, checkpoints, motivation, notes, etc.) instead of a full rewrite. Phase 4 layers Area breadcrumb + Tasks block on top, which is what the YIR design actually adds. Less risk, same end-state.
- **Follow-ups for Phase 5:**
  - Wire `<NotesBlock>` + `<ResourcesBlock>` into project detail (currently project notes live in `legacyNotes`).
  - Add NotesBlock under each Area on `/areas/[id]`.
  - Build Quick Capture → Drift → Process flow (today the Quick Capture sidebar button only stages in `localStorage`).

---

### Phase 3 — Foundation surfaces (Wheel / Vision / Areas)
- **Status:** ✅
- **Date:** 2026-05-14
- **Build:** `next build` exit 0, no errors. `tsc --noEmit` clean. No new linter warnings.
- **Surfaces touched:**
  - **`/wheel`** — `src/app/(app)/wheel/page.tsx` (NEW). Pulls from `getWheelForUser`. Hands data to client-side `<WheelEditor>` for the radar + slider grid + history table. Empty state (no active plan) routes to `/onboarding`.
  - **`/areas`** — `src/app/(app)/areas/page.tsx` (NEW). 3-column editorial grid via `<AreasGrid>` → `<AreaCard>`. Free users see "New area" button with a lock badge; Pro users can create custom areas.
  - **`/areas/[areaId]`** — `src/app/(app)/areas/[areaId]/page.tsx` (NEW). Big icon header tinted with `areaHue`, projects list (max-2 columns) using `levelStyles.project`, calm "Notes & resources" placeholder (filled in Phase 5).
  - **`/vision`** — `src/app/(app)/vision/page.tsx` (NEW). North-star textarea with debounced autosave, vision-board card grid with kind chips (Statement / Value / Milestone / Image / Quote). Empty state offers four starter prompts. At-cap callout for Free (5 cards).
  - **Sidebar Foundation group lit up** — `src/lib/nav-config.ts` (MODIFIED). Re-organised groups: `Home`, **`Foundation` (Wheel · Vision · Areas)**, `Planning` (Projects · Anti-goals · Daily habits), `Rhythm`, `Insights`, `Account`. Breadcrumb resolver knows `/areas/`, `/wheel`, `/vision`.
- **New primitives:**
  - `src/lib/level-styles.ts` (NEW) — single source of truth for area icon / hue / hex per `LifeCategory`, plus `levelStyles` for area/project/task and `lifeCategoryHints` for slider copy.
  - `src/components/areas/area-card.tsx` (NEW) — server-renderable area card with inset color rail, icon tile, status chips for top-3 projects.
  - `src/components/areas/areas-grid.tsx` (NEW) — client wrapper with inline "New area" form (Pro-gated).
  - `src/components/wheel/wheel-editor.tsx` (NEW) — full client editor: radar (current vs previous), `SnapshotCard` (avg / strongest / quietest), 6-slider grid with delta badges, history table, save / reset CTAs. Wires to `/api/wheel`.
  - `src/components/vision/vision-board.tsx` (NEW) — `<NorthStarBlock>` (textarea + debounced PATCH), `<VisionItemsGrid>` (cards + at-cap upsell), `<VisionCard>` (kind chip + actions dropdown), `<ItemDialog>` (create/edit modal).
- **Backend changes:**
  - **Queries:** `src/lib/queries/areas.ts` (NEW — `getAreasForUser`, `getAreaById`, both compute progress + counts), `src/lib/queries/vision.ts` (NEW — `getVisionForUser` defensively upserts), `src/lib/queries/wheel.ts` (NEW — week-bucketed snapshots, current + previous, average).
  - **API:** `/api/areas` GET/POST (NEW), `/api/areas/[areaId]` PATCH/DELETE (NEW), `/api/vision` GET/PATCH (NEW), `/api/vision/items` POST (NEW), `/api/vision/items/[itemId]` PATCH/DELETE (NEW), `/api/vision/items/reorder` POST (NEW). `/api/wheel` POST refined to write all six rows with a shared timestamp so the grouping logic buckets them as one snapshot.
  - **Plan-limit enforcement:** Free users can't create custom areas (402 with `AREA_LIMIT` + `upgradeUrl`); Pro capped at `planLimits.maxAreas`. Vision items capped at `planLimits.maxVisionItems` (5 Free / 50 Pro) — server-side. Default areas can't be deleted.
- **Plan deltas:**
  - **Notes / Resources on Area detail are placeholders.** The PLAN spec calls them "Phase 5 fills these in" — we shipped a calm dashed-border block now, and Phase 5 will swap in `<NotesBlock parentType="AREA">` and `<ResourcesBlock>` once they exist.
  - **Drag-to-reorder for Vision items deferred to Phase 5.** The `/api/vision/items/reorder` endpoint is built and tested, but the UI uses save-order-on-create instead of drag. Easy follow-up: drop in `@dnd-kit/sortable` on `<VisionItemsGrid>` and POST to the reorder endpoint.
  - **Vision image cards use external URLs only.** PLAN noted "no upload for v1 — Pro file uploads only for Resource"; we ship that exactly.
- **Follow-ups:**
  - Phase 5: replace Notes/Resources placeholders on `/areas/[id]` with real `<NotesBlock>` and `<ResourcesBlock>`.
  - Phase 5: wire drag-reorder on `<VisionItemsGrid>` using the existing `/api/vision/items/reorder` endpoint.
  - Phase 6: add image-upload (Vercel Blob) to vision IMAGE cards once Pro file uploads are live for Resource.
  - Phase 7: rename `/goals` → `/projects` in the URL so `<AreaCard>` and `<AreaDetail>` link to `/projects/…` instead of `/goals/…`.

### Phase 2 — Schema + Naming foundation
- **Status:** ✅
- **Date:** 2026-05-14
- **Build:** `next build` exit 0, no errors. `prisma validate` clean. `tsc --noEmit` clean.
- **Surfaces touched:**
  - **Prisma — multi-file schema migration.** Deleted `prisma/schema.prisma` (473 lines, monolithic). Replaced with `prisma/schema/`:
    - `00-base.prisma` — generator, datasource, enums (added: `ParentType`, `ResourceKind`, `VisionItemKind`, `DriftKind`)
    - `10-identity.prisma` — `User` (+ back-relations to new models), `Account`, `Session`, `VerificationToken`, `Subscription`
    - `20-foundation.prisma` — `YearlyPlan`, `WheelOfLifeEntry`, `AntiGoal`, **`Area`**, **`Vision`**, **`VisionItem`**
    - `30-projects.prisma` — `Project` (was `Goal`, `@@map("goals")`), `ProjectCheckpoint` (was `CheckpointGoal`), `KeyResult`, `Motivation`, `Habit`, `GoalNote` (legacy); `Project.areaId` added
    - `40-execution.prisma` — `Task` (was `Action`, `@@map("actions")`), `System` (was `DailySystem`, `@@map("daily_systems")`), `SystemCompletion`
    - `50-rhythm.prisma` — `WeeklyPlan`, `WeeklyCheckIn`, `ProjectCheckIn` (was `GoalCheckIn`), `MonthlyReview`, `QuarterlyReview`
    - `60-knowledge.prisma` — **`Note`**, **`Resource`** (both polymorphic via `parentType + parentId`)
    - `70-system.prisma` — `Streak`, `Achievement`, **`Drift`**, **`DailyState`**
  - **Prisma — config split.** Removed `prisma` block from `package.json`. Added `prisma.config.ts` (Prisma 6.4+ format) pointing at `prisma/schema/` and the `tsx prisma/seed.ts` seed.
  - **Migrations rebaselined.** Old `20250320190000_add_user_disabled_at` (the single pre-Phase-2 migration) folded into a new `00000000000000_baseline/migration.sql` (full current schema). Then `20260514000000_para_foundation/migration.sql` ships the new enums, new tables, the `goals.areaId` column + FK, and a data-seed tail (six default Areas per user, `goals.areaId` back-fill from `category`, one empty `Vision` per user, `goal_notes → notes` copy).
  - **Plan tier limits expanded.** `src/lib/config.ts` `planLimits` extended with PARA keys (`maxProjects`, `maxTasksPerProject`, `maxSystemsPerProject`, `maxAreas`, `maxCustomAreas`, `maxVisionItems`, `maxNotes`, `maxResources`, `canUploadResourceFiles`, `maxResourceFileBytes`, `maxResourceStorageBytes`, `fullWrapped`). Deprecated aliases `maxGoalsPerPlan` / `maxDailySystemsPerGoal` kept for backwards compat.
  - **App-wide codemods.** Every `prisma.goal*` / `tx.goal*` / `db.goal*` call renamed to its `project` counterpart. Property accesses `.goalId → .projectId`, `.goalCheckIns → .projectCheckIns`, `.dailySystems → .systems`, `.checkpointGoals → .checkpoints`, `.actions → .tasks`, `.goalNotes → .legacyNotes`. URL params like `[goalId]` were preserved as dynamic-segment names and destructured into `projectId` inside route handlers.
  - **Query helpers.** `src/lib/queries/{goals,plans,dashboard,check-in,systems,recap,quarterly,analytics,wrapped,weekly-workspace,admin}.ts` — renamed Prisma includes and selects (`goals → projects`, etc.). Added `@deprecated` ergonomic aliases on returned objects (e.g. `{ projects, goals: projects }`) so any still-untouched UI keeps compiling.
  - **API routes.** All `/api/goals/[goalId]/*` route handlers refactored: read `goalId` from the URL, alias to `projectId` in the handler body, query via `db.project`, return `Project not found` instead of `Goal not found`. Includes `/checkpoints/[checkpointId]`, `/goal-notes/[noteId]`, `/key-results/[keyResultId]`, `/systems/[systemId]`, `/systems/complete`. (Route folder names stay as `goals` / `goalId` until Phase 7.)
  - **Cursor rules refreshed.** `.cursor/rules/database.mdc` (multi-file schema, PARA terms, migration policy), `.cursor/rules/naming.mdc` (PARA rename table + Old→New mapping), `.cursor/rules/api-routes.mdc` (PARA plan-limits + new POST example using `db.project`).
- **New primitives:** No new UI primitives. Schema + naming layer only.
- **Backend changes:**
  - **Schema:** 7 model renames (via `@@map`, table names unchanged), 7 new models (`Area`, `Vision`, `VisionItem`, `Note`, `Resource`, `Drift`, `DailyState`), 4 new enums (`ParentType`, `ResourceKind`, `VisionItemKind`, `DriftKind`), 1 new nullable FK on `goals` table (`areaId`).
  - **Migration:** 2 forward-migrations on Neon Postgres (baseline + para_foundation). Migration history table truncated and rebuilt cleanly — no real users were affected (per product decision logged in `DECISIONS.md`).
  - **Data:** `_prisma_migrations` table rebuilt. `users` table now has six rows of default `Area` records each, plus an empty `Vision`, courtesy of the migration tail.
- **Plan deltas:**
  - **Migration history rebaselined.** PLAN had implied a clean `20260514_para_foundation` migration on top of existing history. In practice the previous lone migration relied on shadow-DB state that no longer existed, so we collapsed history to a `baseline + para_foundation` pair. Logged in `DECISIONS.md` 2026-05-14.
  - **Folder/route renames deferred to Phase 7.** Models renamed in code, but `src/app/(app)/goals/`, `src/app/api/goals/`, and `goal_notes` table stay as-is until the cleanup phase. This keeps the diff additive and lets Phase 3+ ship UI without route churn.
- **Follow-ups:**
  - Phase 7: rename `(app)/goals` → `(app)/projects`, `api/goals` → `api/projects`, drop `goal_notes` table, remove deprecated query aliases, remove `maxGoalsPerPlan` / `maxDailySystemsPerGoal` from `planLimits`.
  - Phase 5: light up `Note` + `Resource` UI; promote `Drift` rows from Quick Capture into the right typed entity.
  - Phase 6: light up `DailyState` from `TodayCard` (mood / energy / intention / reflection).

### Phase 1 — `/dashboard` Home (Today landing)
- **Status:** ✅
- **Date:** 2026-05-12
- **Build:** `next build` exit 0, no new warnings.
- **Surfaces touched:**
  - `src/lib/queries/dashboard.ts` (EXTENDED — now also returns `todaySystemsList`, `todayYmd`, `timeZone`, `achievements`; single `Promise.all` round-trip; exports `DashboardData` type)
  - `src/components/dashboard/today-card.tsx` (NEW — client component with optimistic tap-to-complete via `/api/systems/complete`; calm empty state when no systems)
  - `src/components/dashboard/stats-cards.tsx` (RESTYLED — `rounded-2xl`, calm eyebrow labels, smaller muted icons, amber border hover)
  - `src/components/dashboard/wheel-chart.tsx` (RESTYLED — `rounded-2xl` editorial header, uses `chartColors` + `axisDefaults` + `gridDefaults` from `lib/charts-theme.ts`)
  - `src/components/dashboard/goals-overview.tsx` (RESTYLED — `rounded-2xl` container, category color dots, calmer status chip, `<Eyebrow>` header)
  - `src/components/dashboard/quick-actions.tsx` (RESTYLED — editorial header, amber-tinted primary action, calmer secondary grid)
  - `src/components/dashboard/achievements-badge.tsx` (REFACTORED — now pure presentational; receives achievements via props from the dashboard query)
  - `src/app/(app)/dashboard/page.tsx` (RECOMPOSED — uses `<PageContainer>` + `<PageHeader>` + new `<TodayCard>` at top; achievements grid collapses to single column when none)
- **New primitives consumed:** `<PageContainer>` (Phase 0), `chartColors` / `axisDefaults` / `gridDefaults` (Phase 0).
- **Backend changes:** None. No Prisma changes. Same `getActiveSystemsPeriodProgress` + `getSystemsForToday` queries. Same `/api/systems/complete` route.
- **Plan deltas:**
  - Skipped YIR TodayCard sub-features that NBB can't honestly back yet: today's prompt + reflection autosave (no `DailyReflection` model), Mood/Energy daily scales (NBB stores mood weekly), Echo, "anti-goal held/slipped" daily check. Documented in component JSDoc and `PLAN.md` exclusion list. Will revisit if/when those models land.
- **Follow-ups:**
  - When Phase 4 (`/rhythm/daily`) lands, the TodayCard's "See the week" link will naturally make more sense — the daily surface is the deep view.
  - `IcebreakerUpsell` (shown when plan exists but no goals) still uses the older `<Card>` shadcn primitive. Restyle opportunistically during Phase 2 (Goals).
  - `WelcomeDashboard` (no-plan fallback) is largely dead code now that `(app)/layout.tsx` redirects new users to `/onboarding`. Audit removal during Phase 9 (Plan wizard polish).

### Phase 0 — Foundation & audit
- **Status:** ✅
- **Date:** 2026-05-12
- **Build:** `next build` exit 0, no warnings on touched files.
- **Surfaces touched:** No user-visible UI changed. Files created/updated:
  - `src/components/shared/page-container.tsx` (NEW)
  - `src/components/shared/section-header.tsx` (NEW)
  - `src/components/shared/skeleton-card.tsx` (NEW — exports `SkeletonCard` + `SkeletonLine`)
  - `src/components/upgrade/pro-gate.tsx` (NEW)
  - `src/components/upgrade/pro-upsell-card.tsx` (NEW)
  - `src/lib/motion.ts` (NEW)
  - `src/lib/charts-theme.ts` (NEW)
  - `src/lib/feature-flags.ts` (NEW)
  - `src/components/shared/page-header.tsx` (EXTENDED — adds `actions` prop and `loading` flag; legacy `children` still works)
  - `src/components/shared/empty-state.tsx` (POLISHED — amber tile, display title; same API)
  - `src/components/shared/premium-gate.tsx` (DEPRECATED — JSDoc only, still functional)
  - `.cursor/rules/dashboard.mdc` (NEW)
  - `.cursor/rules/components.mdc` (UPDATED — reconciled with new primitives)
- **New primitives catalogued:** `PageContainer`, `SectionHeader`, `SkeletonCard`, `SkeletonLine`, `ProGate`, `ProUpsellCard`.
- **Backend changes:** None. No Prisma changes. No env var changes. No middleware changes.
- **Plan deltas:** None. Phase 0 landed exactly as scoped in `PLAN.md`.
- **Follow-ups:**
  - Migrate the 3 `<PremiumGate>` callsites (`/analytics`, `/rhythm/monthly`, `/rhythm/quarterly`) to `<ProGate>` during their respective phases (5, 6).
  - When Phase 1 begins, the existing `AppContent` callsites in `/dashboard`, `/goals`, `/anti-goals`, `/plan/[year]` should be upgraded to `<PageContainer>` opportunistically — not blocking.

---

## Cross-phase follow-ups parking lot

Capture things noticed during a phase that don't belong to it. Resolve before Phase 10.

- _(empty)_

---

## Decisions log

Record any decision that diverges from `PLAN.md § 6` (Decisions deferred) once we actually make it.

### 2026-05-14 — Pre-Phase 2 plan refinements (user-driven)
- **Vision is life-spanning, not yearly.** Originally PLAN had `Vision (1:1 YearlyPlan)`. User clarified Vision is the *life vision board* — a north-star that persists across many years. Reshaped to `Vision (1:1 User) + VisionItem[]`. Per-year theme keeps living on `YearlyPlan.reflections.theme`. See `PARA.md` decision log.
- **Resource file uploads are Pro-only.** Originally PLAN gave Free 20MB of Vercel Blob storage. User flagged unit-economics risk on the free tier. Final policy: Free = 10 link-only resources, Pro = 200 resources with 25MB/file and 2GB total in Vercel Blob. See `PARA.md` decision log.
- **planLimits expansion confirmed.** New keys: `maxTasksPerProject` (10/200), `maxVisionItems` (5/50), `maxNotes` (20/5000), `maxResources` (10/200), `canUploadResourceFiles` (false/true). All other proposed caps accepted as-is.
- **Prisma multi-file schema adopted.** Schema splits into `prisma/schema/00-base.prisma … 70-system.prisma` as the first commit of Phase 2 (before the rename).
- **`docs/plan/` archived old roadmap.** `ROADMAP.md` and `NEXT_SPRINT.md` (March 2026, pre-PARA) moved to `docs/plan/_archive/`. New forward plan lives in `docs/dashboard-improvisation/`.

---
