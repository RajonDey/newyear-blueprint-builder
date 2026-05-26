# Product vision — IA, surfaces & simplicity

**Status:** Locked (PC-01 · 2026-05-21)  
**Audience:** Founders, contributors, AI agents  
**Companion:** [`PARA.md`](./PARA.md) · [`CHANGELOG.md`](./CHANGELOG.md)

---

## 1. What we're building

YearInReview is a **PARA-aligned year planner** for people who want focus without losing depth:

> Plan in Areas → Projects → Tasks/Systems · Reflect on a weekly → monthly → quarterly rhythm · Stay anchored to Vision, Wheel, and Anti-goals.

**Simplicity does not mean fewer features.** It means:

- One vocabulary (Projects, not Goals)
- One daily home (Dashboard Today)
- Clear *why* when the same concept appears in two places
- Progressive disclosure on dense surfaces (project detail, reviews)

---

## 2. User mental model vs navigation

Users should learn **four intents**, not eleven route names:

| Intent | Question it answers | Nav group | Cadence |
|--------|---------------------|-----------|---------|
| **Today** | What do I do right now? | Today | Daily |
| **Plan** | What am I moving on? | Plan | Ongoing |
| **Reflect** | How did the period go? What next? | Reflect | Weekly → Monthly → Quarterly |
| **Compass** | Who am I becoming? What won't I do? | Foundation | Rarely; referred often |

The **11 sidebar items** are the *implementation* of those intents — not four items, because PARA and rhythm need distinct workspaces. That is intentional.

```
Today      →  Dashboard · Drift inbox
Plan       →  Areas · Projects · Tasks · Systems
Reflect    →  Weekly · Monthly · Quarterly · Analytics
Foundation →  Wheel · Vision · Anti-goals · Year Wrapped
```

Account (Settings · Admin · Sign out) lives in the **topbar avatar** — not the work nav.

---

## 3. Dual-surface pattern (embed + dedicated page)

Some features appear **twice**. That is not duplication — it is **preview vs workspace**, like Notion's inbox widget vs full inbox page.

| Feature | Preview (at-a-glance) | Workspace (full power) | Rule |
|---------|----------------------|------------------------|------|
| **Drifts** | Dashboard `DriftInboxCard` (latest N) | `/drifts` (search, tabs, bulk triage) | Capture via ⌘K always; process where you have time |
| **Anti-goals** | TodayCard pill · project context · reviews | `/anti-goals` (full CRUD list) | Foundation = year-level guardrails reference |
| **Systems / habits** | Dashboard TodayCard checklist | `/systems` (manage, archive, insights) | **Daily home = Dashboard** (`/rhythm/daily` redirects here) |
| **Notes / Resources** | Embedded on Area / Project / Vision | Knowledge index (PC-16) + search (PC-15) | Never orphan editors — index is browse-only |

**Do not remove** preview or workspace surfaces without replacing the lost workflow.

---

## 4. Route map (shipped + planned)

### In sidebar (11)

| Route | Group | Purpose |
|-------|-------|---------|
| `/dashboard` | Today | Daily anchor: systems, mood, reflection, drift preview, nudges |
| `/drifts` | Today | Full capture inbox: process → task / note / archive |
| `/areas`, `/areas/[id]` | Plan | Life domains; projects + notes + resources |
| `/projects`, `/projects/[id]` | Plan | Year outcomes; tasks, systems, KRs, checkpoints |
| `/tasks` | Plan | Cross-project task board |
| `/systems` | Plan | Recurring rituals management |
| `/rhythm/weekly` | Reflect | Weekly plan + review |
| `/rhythm/monthly` | Reflect | Monthly plan + review (Pro) |
| `/rhythm/quarterly` | Reflect | Quarterly plan + review (Pro) |
| `/analytics` | Reflect | Trends from check-ins + DailyState (Pro) |
| `/wheel` | Foundation | Life balance snapshots |
| `/vision` | Foundation | Life-spanning north star + board |
| `/anti-goals` | Foundation | Boundaries that protect focus |
| `/wrapped` | Foundation | Year-end story (seasonal; always reachable) |

### Reachable but not in sidebar

| Route | Role |
|-------|------|
| `/rhythm/daily` | Legacy deep link → **redirect to Dashboard** (PC-05) |
| `/rhythm` | Editorial cadence landing; rhythm sub-nav entry |
| `/recap/[period]` | Printable share cards after reviews |
| `/onboarding` | First-run wizard |
| `/settings` | Avatar dropdown |
| `/knowledge/notes` | Browse all notes (index; editors live on entities) |
| `/knowledge/resources` | Browse all resources |

---

## 5. Execution model (four types on one project)

PARA collapses all work into "Task." We **keep four types** on purpose:

| Type | Model | User question |
|------|-------|---------------|
| Task | `Task` | What's the next action? |
| Key result | `KeyResult` | What's measurable? |
| Checkpoint | `ProjectCheckpoint` | What's the quarter milestone? |
| System | `System` | What do I repeat? |

- `/tasks` and `/systems` list flat views across projects.
- Project detail shows all four; advanced sections collapse by default (accordions), not removed.

---

## 6. LifeCategory vs Area

- **`LifeCategory`** — enum for color, icon, wheel copy (6 defaults).
- **`Area`** — user-owned entity; defaults seeded from categories at signup.

Onboarding picks **categories** → those become **default Areas**. Custom Areas (Pro) borrow a category for styling. In-product copy explains this on Areas, Wheel, and onboarding.

---

## 7. What we will not cut (scope lock)

Confirmed by founder review · locked PC-01:

- All 11 sidebar destinations
- Drift inbox (dashboard + page)
- Anti-goals (embedded + Foundation page)
- All rhythm cadences + Analytics + Wrapped
- Four execution types per project
- Quick Capture hybrid (textarea + ⌘ palette)
- Pro gates on monthly / quarterly / analytics

**Deferred post–v1.0:** Echo AI, PDF export, calendar view, accountability partner.

---

## 8. How docs stay aligned

| Change type | Update |
|-------------|--------|
| New surface or nav item | `nav-config.ts` + this file + `PARA.md` |
| Embed ↔ page policy | This file + `plan/DECISIONS.md` |
| Marketing claim | `MVP_LAUNCH.md` + `src/lib/marketing-plan-copy.ts` |
| Schema / entity | `PARA.md` + `prisma/schema/` |
| Shipped feature | `CHANGELOG.md` |

When Phase 8–9 decisions conflict with older PARA.md rows (embed-only), **this file and `DECISIONS.md` win**.
