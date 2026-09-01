"use server";

import { auth } from "@/lib/auth";
import { submitReport } from "@/lib/data/service";
import { z } from "zod";

const reportSchema = z.object({
  species: z.string(),
  injurySeverity: z.string(),
  environmentalDanger: z.string(),
  vulnerability: z.string(),
  description: z.string().min(10),
  contactPreference: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  photoUrl: z.string().optional(),
});

export async function submitReportAction(data: z.infer<typeof reportSchema>) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = reportSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid report data" };

  const newCase = submitReport({
    reporterId: session.user.id,
    ...parsed.data,
  });

  return { caseId: newCase.id };
}
