import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { vector } from "@electric-sql/pglite-pgvector";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __dbInstance: any;
  // eslint-disable-next-line no-var
  var __pgClient: any;
}

function createDatabase() {
  const useRemotePostgres =
    process.env.USE_POSTGRES === "true" ||
    (process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes("localhost") &&
      !process.env.DATABASE_URL.includes("127.0.0.1"));

  if (useRemotePostgres && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
      });
      return drizzlePg(pool, { schema });
    } catch (err) {
      console.warn("[DB] Remote Postgres connection failed, falling back to embedded PGlite:", err);
    }
  }

  // Embedded PGlite database with pgvector extension
  const dataDir = path.resolve("./.data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglitePath = path.join(dataDir, "impactlens.db");
  const pglite = new PGlite(pglitePath, {
    extensions: { vector },
  });

  globalThis.__pgClient = pglite;
  return drizzlePglite(pglite, { schema });
}

export const db = (globalThis.__dbInstance ??= createDatabase());
export type Database = typeof db;
