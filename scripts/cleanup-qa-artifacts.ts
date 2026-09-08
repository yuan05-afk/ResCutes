/**
 * Remove QA audit / re-audit demo artifacts created during detection-only passes.
 *
 * Matches names/descriptions tagged like:
 * - "QA Reaudit Sep8..."
 * - "QA Audit Sep8..."
 *
 * Usage: npm run db:cleanup-qa
 */
import { eq, inArray, like, or } from "drizzle-orm";
import { getDb } from "@/db";
import {
  animals,
  adoptionApplications,
  casePhotos,
  caseStatusHistory,
  medicalClearances,
  notifications,
  rescueCases,
  rescueReports,
  rescuerAssignments,
  shelterHandoffs,
} from "@/db/schema";

const ANIMAL_NAME_PATTERNS = ["QA Reaudit Sep8%", "QA Audit Sep8%"] as const;
const REPORT_DESC_PATTERNS = ["QA Reaudit Sep8%", "QA Audit Sep8%"] as const;

async function main() {
  const db = getDb();

  const animalRows = await db
    .select({
      id: animals.id,
      name: animals.name,
      temporaryId: animals.temporaryId,
    })
    .from(animals)
    .where(
      or(
        ...ANIMAL_NAME_PATTERNS.map((p) => like(animals.name, p)),
        ...ANIMAL_NAME_PATTERNS.map((p) => like(animals.temporaryId, p)),
      ),
    );

  const reportRows = await db
    .select({
      id: rescueReports.id,
      description: rescueReports.description,
    })
    .from(rescueReports)
    .where(
      or(...REPORT_DESC_PATTERNS.map((p) => like(rescueReports.description, p))),
    );

  const reportIds = reportRows.map((r) => r.id);
  const caseByReport =
    reportIds.length === 0
      ? []
      : await db
          .select({ id: rescueCases.id, caseNumber: rescueCases.caseNumber })
          .from(rescueCases)
          .where(inArray(rescueCases.reportId, reportIds));

  const animalIds = animalRows.map((a) => a.id);
  const caseByAnimal =
    animalIds.length === 0
      ? []
      : await db
          .select({ id: rescueCases.id, caseNumber: rescueCases.caseNumber })
          .from(rescueCases)
          .where(inArray(rescueCases.animalId, animalIds));

  const caseMap = new Map<string, { id: string; caseNumber: string }>();
  for (const row of [...caseByReport, ...caseByAnimal]) {
    caseMap.set(row.id, row);
  }
  const caseRows = [...caseMap.values()];

  console.log(
    `Found ${animalRows.length} QA animal(s), ${caseRows.length} case(s), ${reportRows.length} report(s).`,
  );

  for (const animal of animalRows) {
    await db
      .delete(medicalClearances)
      .where(eq(medicalClearances.animalId, animal.id));
    await db
      .delete(adoptionApplications)
      .where(eq(adoptionApplications.animalId, animal.id));
  }

  for (const caseItem of caseRows) {
    await db
      .update(animals)
      .set({ rescueCaseId: null })
      .where(eq(animals.rescueCaseId, caseItem.id));
    await db
      .update(rescueCases)
      .set({ animalId: null })
      .where(eq(rescueCases.id, caseItem.id));
    await db.delete(notifications).where(eq(notifications.caseId, caseItem.id));
    await db
      .delete(rescuerAssignments)
      .where(eq(rescuerAssignments.caseId, caseItem.id));
    await db.delete(casePhotos).where(eq(casePhotos.caseId, caseItem.id));
    await db
      .delete(caseStatusHistory)
      .where(eq(caseStatusHistory.caseId, caseItem.id));
    await db
      .delete(shelterHandoffs)
      .where(eq(shelterHandoffs.caseId, caseItem.id));
  }

  for (const caseItem of caseRows) {
    await db.delete(rescueCases).where(eq(rescueCases.id, caseItem.id));
    console.log(`Deleted case ${caseItem.caseNumber}`);
  }

  for (const animal of animalRows) {
    await db.delete(animals).where(eq(animals.id, animal.id));
    console.log(`Deleted animal ${animal.name ?? animal.temporaryId}`);
  }

  for (const report of reportRows) {
    await db.delete(rescueReports).where(eq(rescueReports.id, report.id));
  }

  console.log("QA audit artifact cleanup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
