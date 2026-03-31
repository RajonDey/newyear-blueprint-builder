# Database Schema

## Overview

PostgreSQL hosted on Neon. ORM: Prisma 6.

## Entity Relationship

```
User
├── YearlyPlan (1 per year)
│   ├── WheelOfLifeEntry[] (6 categories, multiple snapshots over time)
│   ├── Goal[]
│   │   ├── CheckpointGoal[] (quarterly milestones)
│   │   ├── Action[] (small/medium/big steps)
│   │   ├── DailySystem[]
│   │   │   └── SystemCompletion[] (daily completions)
│   │   ├── Habit[]
│   │   ├── Motivation (1:1)
│   │   └── GoalCheckIn[] (via WeeklyCheckIn)
│   ├── AntiGoal[]
│   ├── WeeklyCheckIn[]
│   │   └── GoalCheckIn[] (per-goal progress)
│   └── QuarterlyReview[]
├── Streak[]
├── Achievement[]
└── Subscription (1:1)
```

## Key Constraints

- `User.email` is unique
- `YearlyPlan` has unique constraint on `[userId, year]`
- `WeeklyCheckIn` has unique constraint on `[planId, weekNumber, year]`
- `Streak` has unique constraint on `[userId, type]`
- `Achievement` has unique constraint on `[userId, type]`

## Indexes

- `WheelOfLifeEntry`: composite index on `[planId, recordedAt]`
- `SystemCompletion`: unique on `[systemId, date]`

## Commands

- `npm run db:push` — Push schema to DB (dev)
- `npm run db:migrate` — Create migration (production)
- `npm run db:seed` — Seed dev data
- `npm run db:studio` — Open Prisma Studio
