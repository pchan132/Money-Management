import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Prisma CLI does NOT auto-load .env.local (a Next.js convention).
// We load it explicitly so DATABASE_URL is available for db push / db pull / migrate.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// DATABASE_URL  — pooler (PgBouncer) URL for runtime queries
// DIRECT_URL    — direct Postgres URL used by db push / db pull / migrate
export default defineConfig({});
