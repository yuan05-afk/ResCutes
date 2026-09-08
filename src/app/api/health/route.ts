import { sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Public deploy health check for demo confidence.
 * Does not expose secrets or internal connection strings.
 */
export async function GET() {
  const started = Date.now();
  const payload: {
    ok: boolean;
    service: string;
    time: string;
    database: "up" | "down" | "unconfigured";
    latencyMs: number;
  } = {
    ok: false,
    service: "rescutes",
    time: new Date().toISOString(),
    database: "unconfigured",
    latencyMs: 0,
  };

  if (!isDbConfigured()) {
    payload.latencyMs = Date.now() - started;
    return Response.json(payload, { status: 503 });
  }

  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    payload.ok = true;
    payload.database = "up";
    payload.latencyMs = Date.now() - started;
    return Response.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    payload.ok = false;
    payload.database = "down";
    payload.latencyMs = Date.now() - started;
    return Response.json(payload, { status: 503 });
  }
}
