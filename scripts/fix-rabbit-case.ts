import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const { eq } = await import("drizzle-orm");
  const { getDb } = await import("../src/db");
  const { rescueCases, rescueReports, casePhotos, users } = await import(
    "../src/db/schema"
  );
  const { stableUuid } = await import("../src/db/stable-ids");

  const db = getDb();
  const caseId = stableUuid("test-case-004");
  const [c] = await db
    .select()
    .from(rescueCases)
    .where(eq(rescueCases.id, caseId))
    .limit(1);

  if (!c) {
    console.log("Case RC-26-109 not found in DB (may only appear after tests).");
    return;
  }

  await db
    .update(rescueCases)
    .set({ caseNumber: "RC-26-109" })
    .where(eq(rescueCases.id, caseId));

  const [reporter] =
    (await db
      .select()
      .from(users)
      .where(eq(users.email, "camille.villanueva@rescutes.demo"))
      .limit(1)) ?? [];
  const [fallback] = await db
    .select()
    .from(users)
    .where(eq(users.email, "citizen@rescutes.demo"))
    .limit(1);
  const uploader = reporter ?? fallback;
  if (!uploader) throw new Error("No reporter user found");

  await db
    .update(rescueReports)
    .set({
      species: "cat",
      description:
        "Adult cream-and-white cat found wandering a residential garden near San Rafael Street. No collar, appears lost but uninjured. Caller can keep watch until a rescuer arrives.",
      reporterId: uploader.id,
    })
    .where(eq(rescueReports.id, c.reportId));

  await db.delete(casePhotos).where(eq(casePhotos.caseId, caseId));
  await db.insert(casePhotos).values({
    id: stableUuid("test-photo-004"),
    caseId,
    url: "/rescue-cases/test-case-004-cat.png",
    uploadedById: uploader.id,
    photoType: "report",
  });

  console.log(
    `Updated ${c.caseNumber} → cat, reporter=${uploader.name}, photo=/rescue-cases/test-case-004-cat.png`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
