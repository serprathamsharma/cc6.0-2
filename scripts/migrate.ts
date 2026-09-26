import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import fs from "fs";
import path from "path";

export async function runMigrations(pgInstance?: any) {
  fs.mkdirSync("./.data", { recursive: true });
  const pg = pgInstance || new PGlite("./.data/impactlens.db", { extensions: { vector } });
  
  await pg.query("CREATE EXTENSION IF NOT EXISTS vector;");
  
  const migrationPath = path.resolve("./src/lib/db/migrations/0000_purple_betty_ross.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");
  const stmts = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const s of stmts) {
    try {
      await pg.query(s);
    } catch (e: any) {
      if (!e.message?.includes("already exists")) {
        console.warn("Migration statement warning:", e.message);
      }
    }
  }

  const tables = await pg.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public'"
  );
  console.log("Migration complete! Tables created:", tables.rows.map((r: any) => r.table_name));
  return pg;
}

if (process.argv[1]?.endsWith("migrate.ts")) {
  runMigrations().then(() => {
    console.log("Database initialized successfully!");
    process.exit(0);
  }).catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
