# Changelog

All notable releases for YearInReview.

## [1.0.0] — 2026-05-21

**Feature-complete v1.0** — product-completeness pass (PC-01 through PC-24).

### Highlights

- **PARA model shipped:** Areas, Projects, Tasks, Systems, Vision, Drifts, Notes, Resources
- **Rhythm loop:** Daily → Weekly → Monthly (Pro) → Quarterly (Pro) with shared cadence workspace
- **Knowledge:** Global notes/resources indexes with discoverability from detail pages and Quick Capture
- **Vision ↔ Projects:** Link projects to vision board cards; dashboard foundation strip
- **Retention:** Email reminder toggles (Settings), crons with opt-out, JSON export (Free + Pro)
- **Trust:** Marketing/pricing/FAQ aligned to shipped caps and features
- **Mobile:** Thumb-first polish on dashboard, rhythm, tasks, drifts, project detail

### Added

- `GET /api/export` — full account JSON bundle (1/hour rate limit)
- `GET /api/search` — tenant-scoped search with rate limit
- Knowledge index pages `/knowledge/notes`, `/knowledge/resources`
- Email preferences in Settings (`User.preferences.emailPreferences`)
- Cron: `monthly-nudge`; weekly reminder moved to Friday UTC
- OG image (`/opengraph-image`)
- E2E smoke: marketing truth, auth gates, API 401 checks
- Vitest: API auth audit (`api-auth-audit.test.ts`)

### Changed

- Onboarding + week-one checklist; yearly plan lifecycle in Settings
- Analytics ↔ rhythm loop (DailyState trends, review CTA)
- Area health rollup on dashboard and `/areas`
- Mobile rhythm sidebars stack below main content on small screens

### Deferred (post–v1.0)

- PDF export, Echo AI, monthly Pro billing checkout, Sentry/PostHog

---

Format based on [Keep a Changelog](https://keepachangelog.com/).
