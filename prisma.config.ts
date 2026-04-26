import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Prisma CLI does NOT auto-load .env.local (a Next.js convention).
// We load it explicitly so DATABASE_URL is available for db push / db pull / migrate.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// DIRECT_URL    — direct Postgres URL used by db push / db pull / migrate
// DATABASE_URL  — pooler (PgBouncer) URL for runtime queries (used via driver adapter in lib/prisma.ts)
export default defineConfig({
  datasource: {
    // Use the direct (non-pooled) URL for Prisma CLI / migrate.
    // Fall back to DATABASE_URL so `prisma generate` works in CI without DIRECT_URL set.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
