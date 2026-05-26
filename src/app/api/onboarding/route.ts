import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { LifeCategory } from "@prisma/client";
import { requireSessionUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import {
  ensureDefaultAreasForUser,
  findDefaultAreaIdForCategory,
} from "@/lib/areas/default-areas";

/**
 * POST /api/onboarding
 *
 * Persists the 3-step Onboarding wizard result in a single transaction:
 *
 *   - Creates the user's first ACTIVE `YearlyPlan` for the current year
 *     (theme word stored on `reflections` JSON since the column is open).
 *   - Seeds 6 `WheelOfLifeEntry` rows: the chosen `strongest`/`weakest`
 *     categories get distinguishing scores (8 / 3) and the rest get a
 *     neutral 5 — so the user has a complete wheel chart from day one.
 *   - Creates the keystone `Goal` (type PRIMARY) and a single `DailySystem`.
 *
 * Safe to call only once per user/year — refuses to overwrite an existing
 * plan and returns 409. After onboarding the user lives in `/dashboard`,
 * `/areas`, `/goals`, and `/systems` for everyday planning — the old `/plan/*`
 * wizard has been replaced by per-section editing.
 */
const onboardingSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  theme: z.string().trim().min(1).max(50),
  strongest: z.nativeEnum(LifeCategory),
  weakest: z.nativeEnum(LifeCategory),
  goalCategory: z.nativeEnum(LifeCategory),
  goalTitle: z.string().trim().min(1).max(500),
  systemTitle: z.string().trim().min(1).max(500),
});

const ALL_CATEGORIES: LifeCategory[] = [
  "HEALTH",
  "CAREER",
  "FINANCE",
  "RELATIONSHIPS",
  "SPIRITUALITY",
  "PASSION",
];

export async function POST(req: Request) {
  const session = await requireSessionUser();
  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "Your session expired or is from a different database. Sign out and sign in again.",
      },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  if (data.strongest === data.weakest) {
    return NextResponse.json(
      { error: "Strongest and weakest must differ" },
      { status: 400 },
    );
  }

  const userId = session.user.id;
  const year = new Date().getFullYear();

  try {
    // Seed areas outside the plan transaction — idempotent, and keeps the
    // interactive tx short (Neon / remote DBs often exceed Prisma's 5s default).
    await ensureDefaultAreasForUser(userId);
    const goalAreaId = await findDefaultAreaIdForCategory(
      userId,
      data.goalCategory,
    );
    if (!goalAreaId) {
      return NextResponse.json(
        { error: "Could not resolve area for your project. Please try again." },
        { status: 500 },
      );
    }

    const result = await db.$transaction(
      async (tx) => {
        const existing = await tx.yearlyPlan.findUnique({
          where: { userId_year: { userId, year } },
        });
        if (existing) {
          throw new Error("PLAN_EXISTS");
        }

        await tx.yearlyPlan.updateMany({
          where: { userId, status: "ACTIVE" },
          data: { status: "ARCHIVED" },
        });

        const plan = await tx.yearlyPlan.create({
          data: {
            userId,
            year,
            status: "ACTIVE",
            reflections: { theme: data.theme, name: data.name ?? null },
          },
        });

        await tx.wheelOfLifeEntry.createMany({
          data: ALL_CATEGORIES.map((category) => ({
            planId: plan.id,
            category,
            rating:
              category === data.strongest
                ? 8
                : category === data.weakest
                  ? 3
                  : 5,
          })),
        });

        const goal = await tx.project.create({
          data: {
            planId: plan.id,
            areaId: goalAreaId,
            category: data.goalCategory,
            type: "PRIMARY",
            title: data.goalTitle,
            sortOrder: 0,
          },
        });

        await tx.system.create({
          data: {
            projectId: goal.id,
            description: data.systemTitle,
            frequency: "DAILY",
            isActive: true,
          },
        });

        return { planId: plan.id, projectId: goal.id };
      },
      { timeout: 15_000, maxWait: 10_000 },
    );

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "PLAN_EXISTS") {
      return NextResponse.json(
        { error: "A plan already exists for this year." },
        { status: 409 },
      );
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Your session is from a different database. Sign out and sign in again.",
        },
        { status: 401 },
      );
    }
    console.error("[/api/onboarding] failed:", err);
    return NextResponse.json(
      { error: "Could not save onboarding. Please try again." },
      { status: 500 },
    );
  }
}
