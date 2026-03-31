# Next Sprint - Phase 7 (Time Navigation & Historical Context)

Sprint window: 2026-03-30
Status: Complete

## Design principles

Users who've been on the platform for weeks/months need to **look back, see patterns, and feel progress**. Every feature in this phase adds temporal depth — the ability to navigate time, not just the present moment.

## Completed tasks

- [x] **P7.1 Week Navigator**
  - Weekly Planner page now accepts `?week=N&year=YYYY` search params.
  - Prev/next arrows let users browse any past week.
  - Past weeks show a clean read-only summary (plan priorities, commitments, review mood,
    goal ratings, notes, blockers, "looking ahead" note).
  - "Today" button to jump back to current week.
  - Future weeks are blocked (no forward arrow past current week).
  - New query `getWeeklyWorkspaceDataForWeek()` fetches historical data.
  - New `WeekNavigator` component for navigation controls.
  - New `WeeklyPastView` component for read-only historical display.

- [x] **P7.2 Daily Habits Calendar Heatmap**
  - 90-day GitHub-style contribution heatmap below the habits checklist.
  - Color intensity maps completion ratio (0%, 25%, 50%, 75%, 100%).
  - Shows "active days" and "perfect days" counts.
  - Weekday labels (M, W, F) for orientation.
  - Less/More legend for color scale.
  - New API endpoint `/api/systems/history` returns aggregated daily counts.
  - Heatmap only renders when user has active systems (no empty noise).

- [x] **P7.3 Dashboard Trend Indicators**
  - Stats cards now show contextual trend badges:
    - Goals card: shows completed count badge
    - Streak card: shows total check-ins count
    - Mood card (renamed from "Current Quarter"): shows mood delta vs previous week
      (improving/dipped with colored badges)
  - Dashboard query enriched with `trends` object (totalCheckIns, moodDelta).

- [x] **P7.4 Goal Timeline Enrichment**
  - Each check-in entry in the goal progress timeline is now a clickable link
    to the corresponding week's Weekly Planner view (`/rhythm/weekly?week=N&year=YYYY`).
  - Hover reveals a subtle external-link icon.
  - Ties goal history directly to the weekly context where it happened.

## Previous phases (complete)

- Phase 1: Correctness & Safety (sanitization, auth, timezone)
- Phase 2: Information Architecture & Naming
- Phase 3: Make Goals Feel Alive (key results, notes, timeline, motivation engine)
- Phase 4: New User Experience (welcome dashboard, empty states, quick-start)
- Phase 5: Rhythm Pages Overhaul (daily/weekly/monthly/quarterly redesign)
- Phase 6: UI Audit & Consistency (12 cross-cutting fixes)

## Out of scope (Phase 8+)

- Planning Workspace / Pages (full Notion-like surface).
- AI coach / suggestions.
- Sharing / accountability partner.
- Richer weekly email with personal stats.
- PDF export improvements.
- Analytics page enhancements (trends, comparisons).
