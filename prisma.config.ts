/**
 * Prisma config file (Prisma 6.4+).
 *
 * Replaces the deprecated `package.json#prisma` block. Defines the multi-file
 * schema folder location and the `prisma db seed` command for `tsx`.
 *
 * Why we use a folder for the schema: domain-aligned files (00-base,
 * 10-identity, 20-foundation, 30-projects, 40-execution, 50-rhythm,
 * 60-knowledge, 70-system) — see `docs/PARA.md`.
 *
 * Why we load dotenv manually: as soon as a `prisma.config.ts` is present,
 * Prisma CLI logs "Prisma config detected, skipping environment variable
 * loading." and does NOT auto-load `.env` / `.env.local`. Next.js conventions
 * put `DATABASE_URL` in `.env.local`, so we hydrate `process.env` here before
 * the schema is parsed. `.env.local` wins over `.env` (Next.js semantics).
 */
import path from "node:path"
import { config as loadEnv } from "dotenv"
import { defineConfig } from "prisma/config"

loadEnv({ path: path.join(process.cwd(), ".env") })
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true })

export default defineConfig({
  schema: path.join("prisma", "schema"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
})
