"use server";

import { auth } from "@/lib/auth";
import { revalidateAfterReport } from "@/lib/cache-revalidate";
import { submitReport } from "@/lib/data/service";
import {
  REPORT_CONTACT,
  REPORT_DANGER,
  REPORT_INJURY,
  REPORT_SPECIES,
  REPORT_VULNERABILITY,
} from "@/lib/forms/animal-field-options";
import { z } from "zod";

const reportSchema = z.object({
  species: z.enum(REPORT_SPECIES),
  injurySeverity: z.enum(REPORT_INJURY),
  environmentalDanger: z.enum(REPORT_DANGER),
  vulnerability: z.enum(REPORT_VULNERABILITY),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be under 2000 characters"),
  contactPreference: z.enum(REPORT_CONTACT),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photoUrl: z.string().max(2000).optional(),
});

export async function submitReportAction(data: z.infer<typeof reportSchema>) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { error: first ?? "Invalid report data" };
  }

  const payload = {
    ...parsed.data,
    photoUrl: parsed.data.photoUrl || undefined,
  };

  const newCase = await submitReport({
    reporterId: session.user.id,
    ...payload,
  });

  revalidateAfterReport(session.user.id, newCase.id, session.user.email);

  return { caseId: newCase.id, caseNumber: newCase.caseNumber };
}
