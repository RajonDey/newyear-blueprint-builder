# Design — YearInReview

A locked design system for this app. Every page redesign reads this file
before emitting code. Do not regenerate per page — extend or amend this file
when the system needs to grow.

This system was authored after a Hallmark audit of three surfaces (marketing
homepage, app dashboard, auth + onboarding) that scored **12 critical, 19 major,
and 19 minor findings**. The fixes are encoded here as rules. The brand
foundations the audits found worth keeping — Fraunces display, Inter body,
warm ivory + ink + amber palette, editorial calm tone, honest copy — are
preserved verbatim and reinforced as locks.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind v3 · shadcn/ui · next-themes (light/dark).
**Genre:** Editorial.
**Voice:** Calm, intentional, written. Not productivity-bro, not wellness-soft.

---

## 1. Genre

**Editorial.** Already declared in `src/app/globals.css` L9 (_"Editorial, calm,
intentional"_) and reinforced here as the locked genre.

The editorial genre means:

- Long-form display type (Fraunces) is the visual anchor, not photography or
  illustration.
- Negative space is the layout device, not card containers.
- Copy carries the page; decoration is rare and earned.
- The user reads the product before they buy or sign up.

Genre overrides applied here (per Hallmark `genres/editorial.md`):

- Pure white surfaces (`#ffffff`) are slop; the project's `bg-card` is a tinted
  ivory, which is correct.
- Radial-gradient hero backgrounds are slop; the SoftBackdrop's amber wash is
  permissible only when **static** (see §6 Motion).
- 3-equal-column feature grids are slop for editorial; vary heights, drop one
  card, replace with prose where possible.

---

## 2. Macrostructure families

Pages are grouped into four families. Each family has one base macrostructure;
pages within a family share that shape and vary only on **archetype knobs**.

| Family              | Macrostructure                                                                                                                   | Routes                                                                                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing**       | **Letter** (first-person, written, intimate; no buttons in fold; reads as a personal note)                                       | `(marketing)/page.tsx` · `pricing` · `how-it-works` · `features` · `about` · `faq` · `refund`                                                                                             |
| **App / workbench** | **Workbench** (one hero panel surfaces the day's most important action; supporting panels asymmetric; function carries the page) | `(app)/dashboard` · `goals` · `tasks` · `projects` · `rhythm/*` · `wheel` · `vision` · `systems` · `areas` · `analytics` · `notes` · `knowledge/*` · `drifts` · `anti-goals` · `settings` |
| **Conversion**      | **Left-aligned Letter** (no centered card on empty viewport; form sits on the page paper, not in a card; layout biased left)     | `(auth)/login` · `(auth)/signup` · `onboarding`                                                                                                                                           |
| **Content**         | **Long Document** (continuous prose with inline section heads; typography only; no marketing CTA strips)                         | `(marketing)/blog/*` · `(marketing)/privacy` · `(marketing)/terms` · `(marketing)/cookies` · `(marketing)/privacy/california`                                                             |
| **Special** (rare)  | Family-specific exceptions, see §11                                                                                              | `wrapped` · `recap/[period]` · `admin/*`                                                                                                                                                  |

### Variation knobs per family

- **Letter (marketing):** archetype choice for the secondary block (pull-quote ·
  numbered plan · tabular spec sheet · conversational FAQ). One enrichment
  permitted (Tier-A CSS art or Tier-B SVG).
- **Workbench (app):** hero panel choice depends on the page (TodayCard on
  dashboard · GoalDetail on goals page · WheelChart on wheel page · etc.). No
  enrichment ever.
- **Left-aligned Letter (conversion):** header treatment (full vs minimal) ·
  step transition stance (cut vs directional fade — see §6).
- **Long Document (content):** section count varies with content length; one
  pull-quote per ~600 words allowed.

### Diversification rule — INVERTED for multi-page

Hallmark's default is _variety_ between consecutive page builds. **For
YearInReview, consistency wins.** Two marketing pages must share the Letter
shape; two app pages must share the Workbench shape. Pages that drift outside
their family are slop, even if they're individually pretty. The audit verb
will flag this as `critical: design-system drift`.

If a page genuinely needs a different shape (e.g. Year-Wrapped wants more
visual ceremony than Workbench allows), **amend this file first** — add a
per-page allowance to §11 — then redesign. Per-page overrides without an
amendment are not allowed.

---

## 3. Theme — tokens

The existing HSL token system in `src/app/globals.css` is the **source of
truth**. Every colour in the project must resolve to one of the named tokens
below. **No inline hex, no inline `oklch()`, no raw `rgb()`, no Tailwind
palette colours (`emerald-500`, `rose-400`, `amber-100`) outside the
status-token map.**

### 3a. Core palette (light mode — preserved, no value changes)

```
--background        38 30% 96%    /* warm ivory paper */
--foreground        222 32% 16%   /* deep ink */
--card              0 0% 100%     /* pure card surface */
--card-foreground   222 32% 16%
--popover           0 0% 100%
--popover-foreground 222 32% 16%
--primary           222 32% 16%   /* ink — primary buttons */
--primary-foreground 38 30% 96%
--secondary         36 24% 92%    /* warm sand */
--secondary-foreground 222 32% 16%
--muted             36 20% 93%    /* light parchment */
--muted-foreground  222 12% 42%
--accent            24 75% 55%    /* warm amber — the brand kicker */
--accent-foreground 0 0% 100%
--border            36 18% 88%    /* hairline */
--input             36 18% 88%
--ring              24 75% 55%    /* amber focus ring */
--radius            0.625rem
```

Dark mode preserved as currently declared in `globals.css` L70–117. No changes.

### 3b. Amber opacity scale — NEW, ends the sprawl

The audits found **9 distinct amber transparency levels** improvised across 20+
files. The locked scale is **three** named tones:

```
--amber-wash       hsl(24 75% 55% / 0.04)   /* faintest paper tint */
--amber-tint       hsl(24 75% 55% / 0.10)   /* card highlight, recommended state */
--amber-emphasis   hsl(24 75% 55% / 0.20)   /* active chip, active border */
```

**Rule.** Any amber transparency in the codebase **must** reference one of
these three. Inline `bg-amber/[0.04]`, `bg-amber/[0.05]`, `bg-amber/[0.06]`,
`bg-amber/[0.10]`, `bg-amber/15`, `bg-amber/25`, `bg-amber/30`, `bg-amber/35`,
`bg-amber/40` etc. are all **banned**. Use `bg-[var(--amber-wash)]` /
`bg-[var(--amber-tint)]` / `bg-[var(--amber-emphasis)]`, or extend
`tailwind.config.ts` with named utilities (`bg-amber-wash`, `bg-amber-tint`,
`bg-amber-emphasis`) and use those.

### 3c. Status tokens — NEW

Stops raw Tailwind semantic colours (`emerald-500/10`, `rose-500/10`,
`amber-100/70`) from leaking into components:

```
--color-status-positive    152 50% 38%   /* emerald — success, "improving" trends */
--color-status-attention   38 80% 50%    /* gold — "at risk", warnings */
--color-status-risk        0 65% 48%     /* destructive — failures, dipped trends */
```

Components consuming status colour MUST use these tokens (via `bg-status-positive`,
`text-status-attention`, etc., wired in Tailwind config). Onboarding's
"emerald-for-strongest" convention is removed — strongest/weakest is
communicated by icon (`<TrendingUp />` / `<TrendingDown />`), not colour.

### 3d. Accent placement budget

Amber may cover **≤ 5 % of any viewport** on marketing pages, **≤ 3 % on app
pages**, **0 % on content pages**. This budget is enforced in §11 (per-page
allowances).

---

## 4. Typography

Locked. The existing pairing is already correct — three faces, no additions.

```
--font-display   Fraunces (Google Fonts via next/font; weights 400/500/600/700)
--font-body      Inter   (next/font; weights 400/500/600)
--font-mono      JetBrains Mono (next/font)
```

- **Display tracking:** `letter-spacing: -0.02em` on h1–h4 (already in `globals.css`).
- **Display style:** Fraunces is a _variable_ serif with soft optical sizing.
  Use weight 500–600 for h1/h2; weight 400 for body-display moments. Italic
  permitted on em-emphasis ("end the year proud — with _proof_"), forbidden
  on whole headings.
- **Body line-height:** `leading-relaxed` (1.625) on prose; `leading-snug`
  (1.375) on headings.
- **Mono:** `tabular-nums` mandatory on any number column (prices, dates,
  stats, percentages). Body copy never uses mono.

**Type scale anchor (Tailwind):**

| Role            | Class                    | Size               |
| --------------- | ------------------------ | ------------------ |
| Hero display    | `text-5xl md:text-7xl`   | clamp(48px → 80px) |
| Section head h2 | `text-3xl md:text-5xl`   | clamp(30px → 48px) |
| Subsection h3   | `text-xl md:text-2xl`    | clamp(20px → 24px) |
| Body lede       | `text-base md:text-lg`   | clamp(16px → 18px) |
| Body            | `text-sm` to `text-base` | 14–16px            |
| Meta / caption  | `text-xs`                | 12px               |

**Banned:**

- Adding a fourth font face. Three is the lock.
- Heading gradients (`bg-clip-text`). Solid ink only; italic em-emphasis is
  the accepted alternative for "alive" text.
- Inter as the display font on any page. Fraunces is the display.

---

## 5. Spacing — 4-point named scale

NEW. Locks the spacing rhythm so two app pages can't accidentally use
`py-24 md:py-32` here and `py-20 md:py-28` there.

```
--space-3xs   0.25rem    · 4px
--space-2xs   0.5rem     · 8px
--space-xs    0.75rem    · 12px
--space-sm    1rem       · 16px
--space-md    1.5rem     · 24px
--space-lg    2rem       · 32px
--space-xl    3rem       · 48px
--space-2xl   4.5rem     · 72px
--space-3xl   7rem       · 112px
```

Section rhythm by family:

- **Marketing sections:** `--space-3xl` between major sections (`py-24
md:py-28`). Vary by ±`--space-sm` per section to avoid uniform padding tell.
- **App page vertical rhythm:** `space-y-8 md:space-y-10` between PageHeader
  and panels (existing `PageContainer spacing="default"`). Keep.
- **Card padding:** `--space-md` (24px) baseline. Hero panel
  (`TodayCard` on dashboard) gets `--space-lg`. Inline strips (`AreasPulse`,
  `VisionProjectsStrip`) get `--space-sm`.
- **Form gaps:** `--space-sm` between label+input pairs. `--space-md` between
  field groups.

**Banned:** raw `px-[34px]`, `py-[18px]`, `gap-[28px]` etc. Use named scale or
Tailwind's default scale (which maps to multiples of 4px).

---

## 6. Motion — **motion-cut with one disciplined exception**

The audit found three motion philosophies coexisting:

- Marketing: SoftBackdrop with perpetual 240s + 360s rotations + 6s breathing dot
- App: motion-cut entirely
- Onboarding: framer-motion fade+slide on every step

The locked stance is **motion-cut everywhere except one place**.

### Easing tokens

```
--ease-out      cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out   cubic-bezier(0.65, 0, 0.35, 1)
--dur-short     160ms
--dur-base      220ms
```

### Per-surface motion rules

| Surface                            | Motion                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing**                      | **Static.** The SoftBackdrop's orbits and seed-of-life become a still composition. Delete the `.sb-rings`, `.sb-seed`, `.sb-seed-dot` `@keyframes` animations from `soft-backdrop.tsx`. The page may have **one** orchestrated entrance on first paint (opacity 0 → 1, no translate, 220ms) — then settled.    |
| **App**                            | **No motion.** Hover state transitions only (`transition-colors var(--dur-short) var(--ease-out)`). No scroll-triggered reveals. No card hover-lift on non-clickable cards.                                                                                                                                    |
| **Conversion (auth)**              | **No motion.** Form fields focus instantly. Submit spinner delay-shows after 200ms minimum (see §7).                                                                                                                                                                                                           |
| **Conversion (onboarding wizard)** | **One disciplined exception.** Step transitions use directional fade: forward `x: 8 → 0`, backward `x: -8 → 0`, 160ms, `--ease-out`. Track direction in state. **Honour `prefers-reduced-motion`** by collapsing to opacity-only ≤ 120ms. Replace `ease: "easeOut"` framer-motion string with the named token. |

### Banned everywhere

- Perpetual ambient motion (forever-spinning backgrounds, infinite breathing
  dots, scrolling marquees that never stop)
- Universal scroll-triggered fade-up
- `transition-all` (specify properties)
- `hover:scale-105` (or any hover-scale lift) on non-clickable surfaces
- Bouncy / overshoot easings (`cubic-bezier(0.34, 1.56, 0.64, 1)` etc.)
- Animated focus rings (focus must appear instantly)
- Animated hover gradients
- Cursor follower dots
- Lottie pulls when CSS or hand-built SVG would do the job

### Reduced-motion fallback

`prefers-reduced-motion: reduce` collapses all animation to opacity-only,
duration ≤ 150ms. No translate, no scale, no rotation.

---

## 7. Microinteractions stance

| Behaviour                        | Rule                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Success feedback                 | **Silent.** The user sees the result; they don't need a toast. No "Saved!" / "Archived!" / "Done!" / "Welcome aboard!" toasts. |
| Failure feedback                 | Toast with `toast.error()` (Sonner). Stays until dismissed or 7s.                                                              |
| Destructive reversible actions   | **Optimistic delete + 7-second Undo toast.** Never a confirmation modal for a single-row delete.                               |
| Destructive irreversible actions | Confirmation modal with **type-the-name** confirmation (not click-OK).                                                         |
| Tooltips                         | Hover delay 800ms · focus delay 0ms. Different intents, different timing.                                                      |
| Spinners                         | Delay-show after 200ms; minimum visible duration 300ms once shown. Prefer skeletons over spinners when layout is known.        |
| Focus rings                      | Appear **instantly**. Never transition `outline` or `box-shadow` on focus gain.                                                |
| Toasts                           | Stack at viewport corner (bottom-right). Existing toasts don't shift when new ones arrive (Sonner default — keep).             |

### Specifically forbidden patterns (from audits)

- `toast.success("Archived")` after the user clicked Archive and watched the
  row disappear. (Drift Inbox card — fix.)
- `toast.success("Start with Today — everything else waits.")` immediately
  before `router.replace("/dashboard")` (Onboarding completion — flash toast,
  invisible, delete it).
- Save-state pills that flash "Saved" after every successful keystroke
  (TodayCard `saveState === "saved"` — drop the "Saved" branch; keep
  "Saving…" only after 250ms; keep "Error" as-is).

---

## 8. CTA voice

Locked recipe for every clickable affordance.

| Role                            | Component                        | Recipe                                                                                                                                                                                      |
| ------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary**                     | `<Button>` (default variant)     | `h-11`, `rounded-md` (radius `0.625rem`), `bg-foreground text-background`, weight 500. Single Lucide icon allowed inline (left of label or right as arrow). Label sentence case, ≤ 3 words. |
| **Hero primary** (one per page) | `<Button size="lg">`             | `h-12 px-8`. Otherwise identical to Primary.                                                                                                                                                |
| **Secondary**                   | `<Button variant="ghost">`       | Same height as Primary, transparent bg, `text-foreground`, `hover:bg-muted/40`. Label may include an arrow icon.                                                                            |
| **Tertiary inline**             | Typographic link                 | `text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground`. No button chrome. Used for "See pricing", "Learn more", "Manage projects" etc.         |
| **Destructive**                 | `<Button variant="destructive">` | Reserved for genuinely destructive irreversible actions.                                                                                                                                    |
| **Outline**                     | `<Button variant="outline">`     | Used only for OAuth providers (Continue with Google) and similar third-party-branded actions.                                                                                               |

### CTA copy rules

- Sentence case, never Title Case ("Start free" not "Start Free").
- ≤ 3 words on Primary. ≤ 5 on Hero.
- Verbs over nouns ("Begin your year" beats "Get started"; "Start free" beats
  "Sign up for free").
- No exclamation marks. The product is calm.
- No emoji in CTAs. Lucide arrow icon is the only permitted glyph.
- One CTA per fold on marketing pages. Two CTAs (primary + secondary ghost
  link) in the hero. Repeating the primary CTA in three sub-strips ("Free,
  no card · Free onboarding · No card required") is forbidden — pick one
  line, ship it once.

### Banned

- Gradient-fill buttons.
- Two-line button labels at any viewport width. If a label wraps at 320px,
  shorten the label (preferred), set `white-space: nowrap`, or collapse to a
  menu.
- Repeating the same CTA copy in three places under the hero ("Free to
  start · No credit card · Free onboarding · Export anytime · Calm by design").
  Pick **one** sub-line, ≤ 8 words. The audit found 4 such restatements on the
  homepage alone — all but one go.
- "Continue with Google" wrapping. Use "Sign in with Google" if narrower.

---

## 9. Section head rhythm — **eyebrows banned by default**

This single rule fixes ~25 audit findings across the three surfaces.

The audits found:

- 9 eyebrows on the marketing homepage
- 15+ eyebrows on the dashboard
- 9 eyebrows in the auth+onboarding flow

The new rule:

**`<Eyebrow>` is opt-in.** It remains in the codebase
(`src/components/atmosphere/eyebrow.tsx`) but **must not** be used as
decoration above section headings. Section heads use Fraunces display weight
500/600 with `tracking-tight` and stand on their own.

### When `<Eyebrow>` IS allowed

Maximum **2 per page**, and only for one of these jobs:

1. **Genuinely ordinal data:** the dashboard meta-line "Week 12 · Q1 · 2026 ·
   Theme" (PageHeader eyebrow on dashboard) — this is contextual data, not
   decoration. ✅ Keep.
2. **Numbered or chaptered ordinal content:** the Plan section's "01 ·
   Reflect / 02 · Plan / 03 · Live / 04 · Review" — these are genuine ordinals
   that build on each other. ✅ Keep (but as numerals in the section
   numbering, not as section-head decoration above each).
3. **Status flags:** "Coming soon" / "Beta" / "Pro" on a single section.

### When `<Eyebrow>` is **forbidden**

- Above section headings as decoration ("The quiet problem", "A calmer way",
  "The plan", "What you get", "Two Decembers", "Pricing", "One year. One
  system." — all delete).
- Above any input label in a form (replace with sentence-case body labels).
- On more than two surfaces per page.
- In the tag-left / header-right two-column pattern (banned by Hallmark
  gate 66 regardless).

### What replaces eyebrows

- Section heads use **Fraunces** display 500/600, `tracking-tight`, sentence
  case (no uppercase).
- For sections that genuinely need labelling beyond the heading, use a
  small `text-sm text-muted-foreground` lede paragraph beneath the heading —
  _prose, not labels_.
- For app pages, sections rarely need labels at all. The page header
  (PageHeader) carries the page identity; section heads inside are
  function-named (`<h2>Today</h2>`, `<h3>Wheel of life</h3>`).

---

## 10. Brand mark — the consolidated mandala

The audits found **four overlapping mandala/spark implementations**:

1. `MandalaWatermark` (full-screen SVG component, auth layout) — **DELETE**
2. `bg-mandala-watermark` (CSS utility, `globals.css` L178–183) — **DELETE**
3. `bg-lotus-corner` (CSS utility, `globals.css` L186–191) — **DELETE**
4. `✦` Unicode glyph (marketing nav, auth header, marketing logo, footer) — **REPLACE**

Plus the app sidebar's literal `Y` letter tile (`app-sidebar.tsx` L61) —
**REPLACE**.

### The single source of truth — `<BrandMark />`

Build one SVG component at `src/components/shared/brand-mark.tsx`:

- **Motif:** the mandala's center — three concentric rings + center dot.
  Drawn in solid amber (`var(--accent)` token).
- **Three sizes, three jobs:**

| Size | Pixel | Job                                    | Where                                                                                  |
| ---- | ----- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `sm` | 16px  | Inline spark (replaces ✦ in body text) | Hero badge, footer signature                                                           |
| `md` | 24px  | Standard brand mark                    | Marketing nav · auth header · onboarding header · app sidebar (replaces "Y" tile)      |
| `xl` | 80px  | Ceremony mark — rare, earned           | Onboarding completion screen · Year-Wrapped page header · (future) anniversary moments |

**Behaviour:**

- `aria-hidden` when paired with the wordmark; `aria-label="YearInReview"`
  when standing alone.
- Renders at full amber opacity at `sm` and `md`. At `xl`, renders at
  `--amber-emphasis` (0.20) so it reads as ambient presence, not a logo
  staring at the reader.
- No motion ever. The mark is static.

### Banned

- Full-screen mandala wash on any page (deletes the entire MandalaWatermark
  pattern).
- The `bg-lotus-corner` decoration on the login form card.
- The `bg-mandala-watermark` utility on any surface.
- Using `✦` Unicode glyph as the brand mark in any new code (existing usages
  to be replaced as part of the shared-foundations pass).
- Adding new "decoration" SVGs that read as background depth (aurora blobs,
  drifting orbs, ambient gradients).

The mandala stays as the **brand mark** — gains semantic weight by being
scarce — and stops being decorative wash.

---

## 11. Per-page allowances

| Family                        | Allowed                                                                                                                                                                             | Forbidden                                                                                                                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Marketing**                 | One enrichment per page (Tier-A CSS art, Tier-B hand-built SVG) · pull-quotes · numbered ordinals where genuine · letter-style opening · `BrandMark xl` only on Wrapped/recap pages | Centered-everything stacks · 3-equal feature grids · ambient backgrounds · purple gradients · aurora blobs · invented metrics · fake testimonials · placeholder names ("Jane Doe") |
| **App / workbench**           | Real Recharts data viz · sparkline meta · status badges via tokens · one hero panel promoted visually per page                                                                      | ANY decoration · enrichment · ambient motion · card-in-card · perpetual animation · uniform card stack · 4-stat dashboard hero grid · emoji as icons                               |
| **Conversion (auth)**         | One illustration permitted on the auth page (right column at md+, hidden on mobile) · letter-style copy · `BrandMark md` in header                                                  | Centered-card-on-empty-viewport · full-screen mandala wash · raw `<input>` / `<button>` (must use shadcn `<Input>` / `<Button>`) · backdrop-blur on non-sticky headers             |
| **Conversion (onboarding)**   | Directional wizard fade (§6 exception) · `BrandMark xl` on completion screen only · sentence-case body labels                                                                       | Raw `<input>` / `<button>` · framer-motion `easeOut` string (use named token) · success toast on completion · emerald accent (use icon for strongest/weakest differentiation)      |
| **Content**                   | Typography only · pull-quotes · drop caps allowed on long form · two-column body text at lg+ on blog posts                                                                          | Card-stacked content · marketing CTA strips at the bottom · ambient backgrounds                                                                                                    |
| **Special — Wrapped / recap** | `BrandMark xl` as ceremony header · one orchestrated motion sequence on first paint (per page-level allowance, amend this file if extending) · larger display type                  | Slot machine animations · confetti · celebratory toasts                                                                                                                            |
| **Special — admin**           | Workbench rules apply (admin is an app surface) · denser table layouts permitted                                                                                                    | Marketing decoration · branded ceremony                                                                                                                                            |

---

## 12. What pages MUST share

These are non-negotiable across the whole product:

- **The `<BrandMark />` SVG** at the size appropriate to the surface (sm in body, md in chrome, xl rare).
- **The Fraunces + Inter + JetBrains Mono pairing.** No font additions, ever, without amending this file.
- **The amber accent + warm ivory paper + deep ink text triad.** Colour replacements are amendments, not page-level choices.
- **Button shape and rhythm:** `rounded-md` (radius `0.625rem`), `h-11` baseline, `h-12 px-8` for hero. shadcn `<Button>` is the only button source — no raw `<button>` for primary affordances.
- **Input shape and rhythm:** shadcn `<Input>` is the only input source — no raw `<input>`. Onboarding's raw inputs are scheduled for replacement.
- **Spacing scale:** the 4-pt named scale (§5) or Tailwind defaults that map to it. No arbitrary `px-[34px]`.
- **Motion stance:** motion-cut except the onboarding-wizard directional fade (§6).
- **Eyebrow ban:** `<Eyebrow>` opt-in only, ≤ 2 per page (§9).
- **Section heading rhythm:** Fraunces display, `tracking-tight`, sentence case.
- **CTA voice and copy rules** (§8).
- **Microinteractions stance** (§7) — silent success, Undo toasts on reversible destructive actions, delay-show spinners, instant focus rings.
- **Token discipline:** every colour and every font in every file references a named token. No inline hex, no raw OKLCH, no improvised amber opacity.

The CSS stamp at the top of every file Hallmark touches:

```css
/* Hallmark · genre: editorial · macrostructure: <family-macrostructure>
 *           · design-system: design.md · designed-as-app
 *           · honest: pass · chrome: pass · tokens: pass · responsive: pass · icons: pass */
```

The `designed-as-app` flag tells future Hallmark runs to read `design.md`, not
invent a new system. The audit verb will flag missing stamps as
`major: missing system reference`.

---

## 13. What pages MAY differ on

- **Macrostructure within the family.** A marketing page can be Letter with a
  numbered plan archetype on the homepage and Letter with a tabular spec-sheet
  archetype on pricing — both still use Letter's voice and the locked
  theme/typography/CTA.
- **Hero archetype** on marketing pages only (HP1 Vertical-rail · HP2
  Marquee-overflow · HP3 Cursor-spotlight · HP4 Decorative-numeral). One
  polish pattern per hero, never two.
- **Enrichment** on marketing pages only — Tier-A CSS art OR Tier-B hand-built
  SVG, one per page, never two.
- **Section count and length.** Letter pages can be short (the homepage) or
  long (a manifesto-style about page); the system doesn't dictate.
- **Hero panel choice** on app pages (TodayCard / GoalDetail / WheelChart
  etc.) — but the _shape_ of the hero panel (full-bleed, no card border, more
  generous padding) is the same across the app.
- **Number of `<Eyebrow>` usages**, up to the cap of 2. Many pages will have
  zero. The dashboard meta-line is the one canonical exception.

---

## 14. Exports — drop-in formats

The locked tokens emitted in four canonical formats so the system is portable.

### `tokens.css` — source of truth

```css
:root {
  /* Light mode — warm ivory paper · deep ink · amber accent */
  --color-paper: oklch(0.965 0.02 75); /* hsl(38 30% 96%) */
  --color-paper-2: oklch(0.928 0.024 74); /* hsl(36 24% 92%) */
  --color-card: oklch(1 0 0); /* hsl(0 0% 100%) */
  --color-muted: oklch(0.935 0.018 74); /* hsl(36 20% 93%) */
  --color-ink: oklch(0.255 0.04 264); /* hsl(222 32% 16%) */
  --color-ink-2: oklch(0.495 0.025 264); /* hsl(222 12% 42%) */
  --color-rule: oklch(0.888 0.02 74); /* hsl(36 18% 88%) */
  --color-accent: oklch(0.69 0.166 50); /* hsl(24 75% 55%) */
  --color-accent-ink: oklch(1 0 0); /* hsl(0 0% 100%) */
  --color-focus: oklch(0.69 0.166 50); /* hsl(24 75% 55%) */

  /* Amber opacity scale */
  --amber-wash: oklch(0.69 0.166 50 / 0.04);
  --amber-tint: oklch(0.69 0.166 50 / 0.1);
  --amber-emphasis: oklch(0.69 0.166 50 / 0.2);

  /* Status tokens */
  --color-status-positive: oklch(0.56 0.118 162); /* hsl(152 50% 38%) */
  --color-status-attention: oklch(0.715 0.165 72); /* hsl(38 80% 50%) */
  --color-status-risk: oklch(0.555 0.196 27); /* hsl(0 65% 48%) */

  /* Type */
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Spacing — 4-pt named scale */
  --space-3xs: 0.25rem;
  --space-2xs: 0.5rem;
  --space-xs: 0.75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4.5rem;
  --space-3xl: 7rem;

  /* Type scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --text-2xl: 1.75rem;
  --text-3xl: 2.25rem;
  --text-4xl: 3rem;
  --text-5xl: 4rem;
  --text-display: clamp(3rem, 6vw, 5rem);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-short: 160ms;
  --dur-base: 220ms;

  /* Radius */
  --radius: 0.625rem;
  --radius-card: 1rem;
  --radius-pill: 9999px;
  --radius-input: 0.375rem;
}

:root.dark {
  /* Dark mode — preserved from globals.css L70-117. See source. */
}
```

### Tailwind v4 `@theme` block

(Forward-compatible — current Tailwind v3 setup keeps using `tailwind.config.ts`.)

```css
@theme {
  --color-paper: oklch(0.965 0.02 75);
  --color-ink: oklch(0.255 0.04 264);
  --color-accent: oklch(0.69 0.166 50);
  --color-rule: oklch(0.888 0.02 74);
  --font-display: "Fraunces", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --spacing-3xs: 0.25rem;
  --spacing-2xs: 0.5rem;
  --spacing-xs: 0.75rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;
  --spacing-2xl: 4.5rem;
  --spacing-3xl: 7rem;
  --text-md: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.375rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 160ms;
  --radius: 0.625rem;
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper": { "$value": "oklch(0.965 0.020 75)", "$type": "color" },
    "ink": { "$value": "oklch(0.255 0.040 264)", "$type": "color" },
    "accent": { "$value": "oklch(0.690 0.166 50)", "$type": "color" },
    "rule": { "$value": "oklch(0.888 0.020 74)", "$type": "color" },
    "amber-wash": {
      "$value": "oklch(0.690 0.166 50 / 0.04)",
      "$type": "color"
    },
    "amber-tint": {
      "$value": "oklch(0.690 0.166 50 / 0.10)",
      "$type": "color"
    },
    "amber-emphasis": {
      "$value": "oklch(0.690 0.166 50 / 0.20)",
      "$type": "color"
    }
  },
  "font": {
    "display": { "$value": "Fraunces", "$type": "fontFamily" },
    "body": { "$value": "Inter", "$type": "fontFamily" },
    "mono": { "$value": "JetBrains Mono", "$type": "fontFamily" }
  },
  "space": {
    "sm": { "$value": "1rem", "$type": "dimension" },
    "md": { "$value": "1.5rem", "$type": "dimension" },
    "lg": { "$value": "2rem", "$type": "dimension" },
    "xl": { "$value": "3rem", "$type": "dimension" }
  },
  "motion": {
    "ease-out": {
      "$value": "cubic-bezier(0.16, 1, 0.3, 1)",
      "$type": "cubicBezier"
    },
    "dur-short": { "$value": "160ms", "$type": "duration" }
  },
  "radius": {
    "default": { "$value": "0.625rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables — current mapping

This is what `globals.css` already declares; preserved verbatim:

```css
:root {
  --background: 38 30% 96%; /* paper */
  --foreground: 222 32% 16%; /* ink */
  --card: 0 0% 100%;
  --card-foreground: 222 32% 16%;
  --primary: 222 32% 16%; /* ink (primary button) */
  --primary-foreground: 38 30% 96%;
  --secondary: 36 24% 92%;
  --secondary-foreground: 222 32% 16%;
  --muted: 36 20% 93%;
  --muted-foreground: 222 12% 42%;
  --accent: 24 75% 55%; /* amber */
  --accent-foreground: 0 0% 100%;
  --border: 36 18% 88%;
  --input: 36 18% 88%;
  --ring: 24 75% 55%;
  --radius: 0.625rem;
}
```

---

## 15. Implementation sequence (post-approval)

Writing `design.md` is the contract. The next sessions apply it in waves:

1. **Foundations.** Update `globals.css` with §3b amber-opacity + §3c status tokens + §5 spacing tokens + §6 easing tokens. Extend `tailwind.config.ts` to expose them as utilities. Build `<BrandMark />`. Lock `<Input>` and `<Button>` parity (onboarding raw inputs migrate to shadcn). Delete `MandalaWatermark`, `bg-mandala-watermark`, `bg-lotus-corner`, `text-gradient-brand`.
2. **Wave A — Marketing homepage** following Letter macrostructure: drop ~5 eyebrows, break the 3-card grids, replace N1 nav with editorial masthead, replace AI-shaped footer with Letter-close, static SoftBackdrop.
3. **Wave B — Conversion** (auth + onboarding): left-aligned Letter shell, kill centred-card pattern, kill mandala wash, replace raw inputs/buttons with shadcn atoms, replace celebratory success toast, directional wizard fade with named tokens.
4. **Wave C — Dashboard hero promotion + card-stack break:** TodayCard becomes full-bleed hero, drop card containers on 4–5 panels, replace 4-stat grid with editorial stat strip, fix Drift inbox hover-only actions + Undo.
5. **Wave D — App pages** in batches by similarity (goals/tasks/projects/rhythm).
6. **Wave E — Marketing inner pages** (pricing, how-it-works, features, about, faq) following Wave A's Letter recipe with archetype variation.
7. **Wave F — Content pages** (blog, legal) following Long Document.
8. **Wave G — Special pages** (Wrapped, recap) following the per-page allowances in §11.

Each wave is reviewable independently. No wave starts without your `redesign`
command. `hallmark audit` may be re-run on any surface to verify adherence to
this file (the audit will check against `design.md` automatically once the
file is at the project root).

---

## 16. Amending this file

This system is a living contract, not stone tablets. To amend:

1. Name what should change and why (e.g. _"Marketing pages need a Photographic
   family for product-launch announcements"_).
2. Update the relevant section(s) of this file with the new rule.
3. Add a `## Variants` or `## Per-page allowances` entry if the change is
   page-specific.
4. The next `hallmark redesign` reads the amended file as the new system.

Do **not** override `design.md` per page. If a page needs to break the system,
amend the system first. Per-page drift without an amendment is slop — even if
the page is pretty.

---

_Authored 2026-05-26 after audits of marketing homepage, app dashboard, and
auth+onboarding surfaces. Hallmark skill v1.0.0._
