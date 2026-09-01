import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export const db = createDb();

export function getDb() {
  if (!db) {
    throw new Error(
      "DATABASE_URL is not configured. Set it in your environment to use database features.",
    );
  }
  return db;
}

export function isDbConfigured(): boolean {
  return !!process.env.DATABASE_URL && !!db;
}
