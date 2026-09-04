/**
 * One-time migration for hybrid rescue stages.
 * Collapses legacy mid-statuses onto the simplified write path.
 *
 * Usage: npx tsx scripts/migrate-rescue-stages.ts
 */
import { getDb } from "@/db";
import { rescueCases } from "@/db/schema";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";

async function main() {
  const db = getDb();

  const underVerification = await db
    .update(rescueCases)
    .set({ status: "report_submitted", updatedAt: new Date() })
    .where(eq(rescueCases.status, "under_verification"))
    .returning({ id: rescueCases.id });

  const withRescuer = await db
    .update(rescueCases)
    .set({ status: "rescuer_assigned", updatedAt: new Date() })
    .where(
      inArray(rescueCases.status, ["rescue_accepted", "rescue_in_progress"]),
    )
    .returning({ id: rescueCases.id });

  const secured = await db
    .update(rescueCases)
    .set({ status: "animal_secured", updatedAt: new Date() })
    .where(eq(rescueCases.status, "awaiting_shelter"))
    .returning({ id: rescueCases.id });

  const completed = await db
    .update(rescueCases)
    .set({ status: "completed", updatedAt: new Date() })
    .where(
      and(
        eq(rescueCases.status, "shelter_handoff"),
        isNotNull(rescueCases.animalId),
      ),
    )
    .returning({ id: rescueCases.id });

  console.log(
    JSON.stringify(
      {
        underVerification: underVerification.length,
        withRescuer: withRescuer.length,
        secured: secured.length,
        completed: completed.length,
      },
      null,
      2,
    ),
  );

  const remaining = await db.execute(sql`
    SELECT status, count(*)::int AS count
    FROM rescue_cases
    GROUP BY status
    ORDER BY status
  `);
  console.log("status counts:", remaining);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
