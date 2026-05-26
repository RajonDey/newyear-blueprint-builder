# PARA / Second Brain — how NBB maps onto it

Reference for keeping the conceptual model straight while reading component
names, route paths, and database tables.

The Phase 2 → 7 rebuild aligns NBB with **Tiago Forte's PARA** as adapted
in the YIR / Lovable design study.

---

## The PARA hierarchy

```
Area       (life domain — ongoing, no end date)
├─ Project (concrete endeavour within an area — has start + finish)
│  └─ Task (actionable unit under a project)
└─ Notes & Resources (transversal — attachable to ANY level above)
```

Why each layer matters:

- **Areas don't end.** "Health" is a lifelong responsibility, not a project. Areas hold context.
- **Projects start and finish.** "Build a training base" is a 2026 endeavour. It belongs under the Health area.
- **Tasks are concrete units of work.** They have a done state.
- **Notes & Resources support the work.** They float across the hierarchy — a meditation article belongs to Spirituality (Area); a workout PDF to "Build a training base" (Project); a refactor checklist to a specific Task.

---

## NBB entity mapping (post Phase 2 schema)

| PARA layer | NBB Prisma model | Notes |
|---|---|---|
| **Area** | `Area` *(NEW)* | 6 default Areas seeded per user from `LifeCategory` enum. Custom Areas Pro-only. |
| **Vision** | `Vision` + `VisionItem[]` *(NEW)* | **One per User, life-spanning** (not per year). North-star statement + multi-card vision board. Items are typed: STATEMENT, VALUE, MILESTONE, IMAGE, QUOTE. Each item can optionally anchor to an Area. |
| **Project** | `Project` *(renamed from `Goal`)* | Keeps all existing fields: `status`, `category`, `keyResults`, `checkpoints`, `motivation`. Now has `areaId` linking to Area. |
| **Task** | `Task` *(renamed from `Action`)* — plus `KeyResult` & `ProjectCheckpoint` for typed work | UI shows all three on Project detail. `/tasks` shows the flat `Task` list across all projects (one-off items). |
| **System** | `System` *(renamed from `DailySystem`)* | Recurring rituals with frequency. `/systems` is the top-level management surface; Dashboard TodayCard shows today's. |
| **Note** | `Note` *(NEW, replaces `GoalNote`)* | `parentType ∈ { AREA, PROJECT, TASK, SYSTEM, VISION }` + `parentId`. |
| **Resource** | `Resource` *(NEW)* | LINK (all tiers) or FILE (Pro only — Vercel Blob). Same parent pattern as Note. Free: 10 links total. Pro: 200 links + 2GB file storage. |
| **Drift** | `Drift` *(NEW)* | Free-form `⌘K` quick captures. Lifecycle: INBOX → PROCESSED (into Note/Task/Project) → ARCHIVED. |
| **DailyState** | `DailyState` *(NEW)* | One row per user per date. Mood, energy, reflection, prompt key, anti-goal-held check. |

### Why split actionable work across `Task`, `KeyResult`, `ProjectCheckpoint`, `System`?

The original `Goal` model split actionable work by intent. We preserved that:

- **`Task`** (renamed from `Action`) — one-off actionable item with a `done` state ("Talk to recruiter")
- **`KeyResult`** — measurable target with progress 0–100 ("Save $24k by year-end")
- **`ProjectCheckpoint`** (renamed from `CheckpointGoal`) — quarterly milestone ("Q2: $12k saved")
- **`System`** (renamed from `DailySystem`) — recurring ritual ("Walk 8k steps daily")

PARA collapses these into a single "Task." We don't — *NBB's model is
richer*, and collapsing it would be a regression. The Project detail page
shows all four kinds in one Tasks section (typed by icon/label). The
top-level `/tasks` route shows only the `Task` rows (one-off items). The
top-level `/systems` route shows only `System` rows (recurring).

### Why not rename `LifeCategory` → `Area`?

Because:

- `LifeCategory` is an **enum** with semantics tied to UI (color, icon).
- `Area` is a real **entity** owned by the user.
- They serve different purposes: enums label, entities own.
- Areas have a category hint (`Area.category: LifeCategory`) so a custom Area like "Craft" can borrow the Passion color and icon without being forced into a single bucket.

---

## URL conventions

### Active routes (after Phase 7)

| Concept | URL pattern | Tier-relevant cap |
|---|---|---|
| Dashboard | `/dashboard` | — |
| Wheel of Life | `/wheel` | — |
| Vision | `/vision` | Free 5 board items · Pro 50 |
| Areas | `/areas` · `/areas/[areaId]` | Free 6 defaults · Pro 50 |
| Projects | `/projects` · `/projects/[projectId]` | Free 3 · Pro 20 |
| Tasks | `/tasks` | — |
| Systems | `/systems` | Free 3/project · Pro 10/project |
| Rhythm Weekly | `/rhythm/weekly` | — |
| Rhythm Monthly | `/rhythm/monthly` | — |
| Rhythm Quarterly | `/rhythm/quarterly` | **Pro-gated** |
| Analytics | `/analytics` | **Pro-gated** |
| Wrapped | `/wrapped` | Free summary · Pro cinematic |
| Drift inbox | `/drifts` | — |
| Anti-goals (Foundation) | `/anti-goals` | Free 3/plan · Pro 50 |
| Settings | `/settings` | — (topbar avatar, not sidebar) |
| Recap (printable) | `/recap/[period]` | — |
| Onboarding | `/onboarding` | — |

> **Dual-surface features:** Drifts and Anti-goals also appear embedded on the Dashboard and in entity context. See [`VISION.md`](./VISION.md) §3.

### Deprecated / alias routes (301 or redirect)

| Old | New | Notes |
|---|---|---|
| `/goals` | `/projects` | |
| `/goals/[id]` | `/projects/[id]` | |
| `/api/goals/*` | `/api/projects/*` | |
| `/plan/new` | `/onboarding` | |
| `/plan/[year]` | `/dashboard` | Per-year theme → Settings (PC-08) |
| `/rhythm/daily` | `/dashboard#today` | Planned PC-05; was `/systems` in Phase 7 redirects |

---

## Decision history

| Date | Decision | Rationale |
|---|---|---|
| 2026-05-13 | Adopt PARA as the structural model | User clarified YIR was intentionally designed around Second Brain principles, not stylistic borrowing. |
| 2026-05-13 | Rename `Goal` → `Project` everywhere (code, URLs, marketing, UI) | Align user-facing terminology with the PARA / YIR model. Use Prisma `@@map` to keep DB tables intact (zero-data-risk migration). |
| 2026-05-13 | Areas: 6 defaults Free, custom Pro-only | Same gating pattern as anti-goals / projects caps. |
| 2026-05-13 | Resources: include file attachments (not links-only) | User explicitly requested. Storage via Vercel Blob. (Tier policy refined 2026-05-14.) |
| 2026-05-14 | **Vision is life-spanning, not per-year** | Vision boards align a person across multiple years, not one. Schema: `Vision (1:1 user) + VisionItem[]` instead of `Vision (1:1 plan)`. Per-year theme keeps living on `YearlyPlan.reflections`. |
| 2026-05-14 | **Resource file uploads are Pro-only** | Free Resources are URL/link rows only — costs us nothing. Pro unlocks Vercel Blob uploads (25MB/file, 2GB total). Caps Free at 10 resources, Pro at 200. Protects unit economics on the free tier. |
| 2026-05-13 | Keep NBB's task-by-intent split (Task / KeyResult / ProjectCheckpoint / System) | NBB's model is richer than PARA's "Task" — collapsing is a regression. UI shows them together. |
| 2026-05-13 | Daily mood (DailyState) and weekly mood (WeeklyCheckIn) coexist | Daily lives in DailyState, weekly in WeeklyCheckIn. Analytics aggregates daily into weekly trends without conflict. |
| 2026-05-14 | Restructure sidebar into 5 groups: Foundation / Planning / Rhythm / Insights / Account | Matches user's PARA mental model. Replaces ad-hoc nav. *(Superseded by 2026-05-15 four-group IA — see DECISIONS.md.)* |
| 2026-05-14 | `/anti-goals` page removed — anti-goals embed only | **Superseded 2026-05-21:** embed *plus* Foundation page — dual-surface pattern. |
| 2026-05-14 | Drift page removed — Dashboard inbox only | **Superseded 2026-05-21:** embed *plus* `/drifts` workspace — dual-surface pattern. |
| 2026-05-14 | Notes / Resources: embedded on entities only | **Amended 2026-05-21:** embed remains primary; browse index at `/knowledge/*` planned (PC-16). No standalone rich editor. |
| 2026-05-14 | `Action` → `Task`, `DailySystem` → `System` renames added to Phase 2 | Round out the rename for full PARA terminology alignment. |
| 2026-05-14 | Consolidate phases to 6 (2–7) with end-of-month target | User signalled they want to stop iterating and ship. |
| 2026-05-15 | Sidebar → 4 groups / 11 items; Drift inbox in nav; Anti-goals in Foundation | See `DECISIONS.md` · Phase 9. |
| 2026-05-21 | **Dual-surface IA locked** — preview + workspace for Drifts & Anti-goals; all 11 nav items kept | Founder review + [`VISION.md`](./VISION.md). Simplicity via clarity, not removal. |

---

## Out of scope this rollout

- **Renaming `LifeCategory` enum** — stays as-is, used as Area's category hint
- **Standalone `/tasks/[id]` URL** — task detail is a drawer/modal for now
- **Standalone Notes editor** with `/`-commands — future workstream
- **Echo AI** — future workstream after Phase 7
- **File preview in browser** for Resources — future
