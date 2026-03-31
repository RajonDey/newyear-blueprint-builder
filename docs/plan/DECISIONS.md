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
