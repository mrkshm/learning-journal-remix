import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { env } from "~/config/env";

if (!env.DATABASE_PATH) {
    throw new Error("Missing environment variable: DATABASE_PATH");
}

console.log("DATABASE_PATH from env", env.DATABASE_PATH);

// Check if directory exists, if not, create it
const dir = dirname(env.DATABASE_PATH);
if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
}

export const db = drizzle(
    new Database(env.DATABASE_PATH),
);

// Automatically run migrations on startup
void migrate(db, {
    migrationsFolder: "app/db/migrations",
});
