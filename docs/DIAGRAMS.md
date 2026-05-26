# YearInReview — project diagrams

Copy any section below into your notes app (Notion, Obsidian, Apple Notes via screenshot, etc.).  
All diagrams use [Mermaid](https://mermaid.live) — paste into [mermaid.live](https://mermaid.live) to export PNG/SVG.

**Legend:** `ModelName` = Prisma model · `(table_name)` = PostgreSQL table when different.

---

## 1. One-page cheat sheet

```
┌─────────────────────────────────────────────────────────────────┐
│  YEARINREVIEW — PARA year planner (yearinreview.online)         │
├─────────────────────────────────────────────────────────────────┤
│  STACK     Next.js 16 · TS · Prisma 6 · Neon · NextAuth v5      │
│            Lemon Squeezy · Resend · Vercel Blob · Upstash Redis │
├─────────────────────────────────────────────────────────────────┤
│  PARA      Area → Project → Task / KeyResult / Checkpoint /     │
│            System · Note & Resource attach anywhere             │
├─────────────────────────────────────────────────────────────────┤
│  ANCHORS   Vision (life-spanning) · Wheel · Anti-goals          │
│            YearlyPlan (per calendar year)                       │
├─────────────────────────────────────────────────────────────────┤
│  RHYTHM    Weekly plan+review → Monthly (Pro) → Quarterly (Pro) │
│            DailyState (mood/energy) · Drift inbox (⌘K)          │
├─────────────────────────────────────────────────────────────────┤
│  TIERS     Free: 3 projects · Pro: 20 projects + depth features │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. PARA hierarchy (conceptual)

```mermaid
flowchart TB
  subgraph User["👤 User"]
    V[Vision + VisionItems<br/>life-spanning]
    A[Areas<br/>life domains]
    YP[YearlyPlan<br/>one per year]
  end

  subgraph Plan["📋 Plan layer"]
    P[Project<br/>year outcome]
    T[Task]
    KR[KeyResult]
    CP[ProjectCheckpoint]
    SY[System<br/>recurring ritual]
  end

  subgraph Knowledge["📚 Knowledge — polymorphic"]
    N[Note]
    R[Resource LINK/FILE]
  end

  subgraph Meta["⚡ Cross-cutting"]
    D[Drift inbox]
    DS[DailyState]
    AG[AntiGoal]
    W[WheelOfLifeEntry]
  end

  A --> P
  YP --> P
  YP --> AG
  YP --> W
  V -.optional link.-> P
  P --> T & KR & CP & SY
  N & R -.parentType + parentId.-> A & P & T & SY & V

  D -->|process| N & T & R
  DS -->|antiGoalHeld| AG
```

---

## 3. Identity & billing ER

```mermaid
erDiagram
  User ||--o{ Account : "NextAuth"
  User ||--o{ Session : "NextAuth"
  User ||--o| Subscription : "Lemon Squeezy"
  User ||--o{ YearlyPlan : owns
  User ||--o{ Area : owns
  User ||--o| Vision : "1:1 life-spanning"
  User ||--o{ Streak : gamification
  User ||--o{ Achievement : gamification
  User ||--o{ Note : owns
  User ||--o{ Resource : owns
  User ||--o{ Drift : inbox
  User ||--o{ DailyState : "per day"
  User ||--o{ ReviewTemplate : custom prompts

  User {
    cuid id PK
    string email UK
    enum role "USER|ADMIN"
    enum planTier "FREE|PRO"
    json preferences
    datetime disabledAt
  }

  Subscription {
    cuid id PK
    string lsCustomerId UK
    string lsSubscriptionId UK
    enum status
  }
```

---

## 4. Foundation & projects ER

```mermaid
erDiagram
  YearlyPlan ||--o{ Project : "table: goals"
  YearlyPlan ||--o{ AntiGoal : boundaries
  YearlyPlan ||--o{ WheelOfLifeEntry : snapshots
  Area ||--o{ Project : optional
  Vision ||--o{ VisionItem : board cards
  Area ||--o{ VisionItem : optional anchor
  VisionItem ||--o{ Project : visionItemId
  Project ||--o{ Task : "table: actions"
  Project ||--o{ KeyResult : measurable
  Project ||--o{ ProjectCheckpoint : "table: checkpoint_goals"
  Project ||--o{ System : "table: daily_systems"
  Project ||--o| Motivation : why/consequence
  Project ||--o{ ProjectCheckIn : weekly per-project

  YearlyPlan {
    int year
    enum status "DRAFT|ACTIVE|COMPLETED|ARCHIVED"
    json reflections "theme etc"
  }

  Area {
    string name
    enum category "LifeCategory hint"
    bool isDefault
  }

  Project {
    enum category LifeCategory
    enum type "PRIMARY|SECONDARY"
    enum status GoalStatus
    string title
  }

  Vision {
    text northStar
  }
```

---

## 5. Execution ER

```mermaid
erDiagram
  Project ||--o{ Task : one-off work
  Project ||--o{ System : recurring
  System ||--o{ SystemCompletion : "unique per date"

  Task {
    enum type "SMALL|MEDIUM|BIG"
    enum status GoalStatus
    text description
  }

  KeyResult {
    float currentValue
    float targetValue
    string unit
  }

  ProjectCheckpoint {
    enum quarter "Q1-Q4"
    enum status GoalStatus
  }

  System {
    enum frequency "DAILY|WEEKLY|MONTHLY"
    bool isActive
  }

  SystemCompletion {
    date date UK "with systemId"
  }
```

---

## 6. Rhythm ER (plan + review pairs)

```mermaid
erDiagram
  YearlyPlan ||--o{ WeeklyPlan : forward
  YearlyPlan ||--o{ WeeklyCheckIn : reflection
  WeeklyCheckIn ||--o{ ProjectCheckIn : "table: goal_check_ins"
  YearlyPlan ||--o{ MonthlyPlan : forward
  YearlyPlan ||--o{ MonthlyReview : reflection
  YearlyPlan ||--o{ QuarterlyPlan : forward
  YearlyPlan ||--o{ QuarterlyReview : reflection
  Project ||--o{ ProjectCheckIn : progress

  WeeklyPlan {
    int weekNumber
    int year UK "with planId"
    string[] priorityProjectIds
  }

  WeeklyCheckIn {
    int weekNumber
    int overallMood "1-5"
    text nextWeekFocus
  }

  MonthlyReview {
    int month
    int year UK "with planId"
    json responses "template answers"
  }

  QuarterlyReview {
    enum quarter UK "with planId"
    json wheelOfLifeSnapshot
  }
```

---

## 7. Polymorphic knowledge (Note + Resource)

Notes and resources are **not FK-linked** — they use `(parentType, parentId)`:

```mermaid
flowchart LR
  subgraph ParentType["ParentType enum"]
    AREA
    PROJECT
    TASK
    SYSTEM
    VISION
    VISION_ITEM
  end

  Note["Note (notes)"]
  Resource["Resource (resources)<br/>LINK or FILE"]

  ParentType --> Note
  ParentType --> Resource

  User["User (owner)"] --> Note
  User --> Resource
```

| Model | Table | Free cap | Pro cap |
|-------|-------|----------|---------|
| Note | `notes` | — | — |
| Resource LINK | `resources` | 10 total | 200 |
| Resource FILE | `resources` | — | 2 GB blob |

---

## 8. Daily loop & meta ER

```mermaid
erDiagram
  User ||--o{ DailyState : "unique userId+date"
  AntiGoal ||--o{ DailyState : "antiGoalHeldId"
  YearlyPlan ||--o{ AntiGoal : per year
  User ||--o{ Drift : "⌘K capture"
  User ||--o{ Streak : "WEEKLY_CHECK_IN | DAILY_SYSTEM"

  DailyState {
    date date UK
    int mood "1-5"
    int energy "1-5"
    text intention
    text reflection
    bool antiGoalHeld
  }

  Drift {
    enum kind "THOUGHT|TASK|NOTE|..."
    datetime resolvedAt
    string resolvedRef "promoted entity id"
  }

  Streak {
    enum type StreakType
    int currentStreak
    int longestStreak
  }
```

---

## 9. App architecture

```mermaid
flowchart TB
  subgraph Client["Browser"]
    M["(marketing)/ public pages"]
    A["(app)/ authenticated portal"]
    AD["admin/ role-gated"]
  end

  subgraph Next["Next.js 16 App Router"]
    RSC["RSC pages<br/>lib/queries/*"]
    API["api/ route handlers"]
    MW["middleware.ts<br/>auth + rate limit"]
  end

  subgraph External["External services"]
    Neon[(Neon PostgreSQL)]
    Google[Google OAuth]
    Resend[Resend email]
    LS[Lemon Squeezy]
    Blob[Vercel Blob]
    Redis[Upstash Redis]
  end

  Client --> MW --> RSC & API
  RSC & API --> Neon
  API --> Google & Resend & LS & Blob
  MW --> Redis
```

---

## 10. Navigation map (4 intents → 11 routes)

```mermaid
flowchart LR
  subgraph Today["Today"]
    D1["/dashboard"]
    D2["/drifts"]
  end

  subgraph Plan["Plan"]
    P1["/areas"]
    P2["/projects"]
    P3["/tasks"]
    P4["/systems"]
  end

  subgraph Reflect["Reflect"]
    R1["/rhythm/weekly"]
    R2["/rhythm/monthly Pro"]
    R3["/rhythm/quarterly Pro"]
    R4["/analytics Pro"]
  end

  subgraph Foundation["Foundation"]
    F1["/wheel"]
    F2["/vision"]
    F3["/anti-goals"]
    F4["/wrapped"]
  end

  subgraph Hidden["Not in sidebar"]
    H1["/knowledge/notes"]
    H2["/knowledge/resources"]
    H3["/settings"]
    H4["/onboarding"]
  end
```

---

## 11. Schema file map

| File | Domain | Models |
|------|--------|--------|
| `00-base.prisma` | Enums | Role, PlanTier, ParentType, … |
| `10-identity.prisma` | Auth & billing | User, Account, Session, Subscription |
| `20-foundation.prisma` | Year structure | YearlyPlan, Area, Vision, VisionItem, Wheel, AntiGoal |
| `30-projects.prisma` | PARA projects | Project, KeyResult, ProjectCheckpoint, Motivation |
| `40-execution.prisma` | Doing | Task, System, SystemCompletion |
| `50-rhythm.prisma` | Cadence | Weekly/Monthly/Quarterly Plan+Review, ReviewTemplate |
| `60-knowledge.prisma` | Notes & files | Note, Resource |
| `70-system.prisma` | Meta | Streak, Achievement, Drift, DailyState |

---

## 12. Legacy table names (important!)

Prisma model names use PARA vocabulary; PostgreSQL tables keep legacy names:

| Prisma model | DB table | Legacy FK column |
|--------------|----------|------------------|
| Project | `goals` | — |
| Task | `actions` | `goalId` → project |
| System | `daily_systems` | `goalId` → project |
| ProjectCheckpoint | `checkpoint_goals` | `goalId` |
| KeyResult | `key_results` | `goalId` |
| Motivation | `motivations` | `goalId` |
| ProjectCheckIn | `goal_check_ins` | `goalId` |

API redirects: `/api/goals/*` → `/api/projects/*` · pages: `/goals` → `/projects`.

---

## Export tips

1. **PNG/SVG:** Paste any `mermaid` block into [mermaid.live](https://mermaid.live) → Actions → Export.
2. **Obsidian:** Paste directly — Mermaid renders natively.
3. **Notion:** Use `/code` block, set language to Mermaid (or paste image export).
4. **Apple Notes:** Export PNG from mermaid.live and attach.

**Related docs:** [`PARA.md`](./PARA.md) · [`VISION.md`](./VISION.md) · [`ARCHITECTURE.md`](./ARCHITECTURE.md)
