"use server";

import { auth } from "@/lib/auth";
import { revalidateAfterReport } from "@/lib/cache-revalidate";
import { submitReport } from "@/lib/data/service";
import { updateUserProfilePrefs } from "@/lib/data/user-profile";
import {
  REPORT_CONTACT,
  REPORT_DANGER,
  REPORT_INJURY,
  REPORT_SPECIES,
  REPORT_VULNERABILITY,
  validatePhoneRequired,
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
  phone: z.string().trim().min(1, "Phone number is required"),
  locationNote: z.string().trim().max(300).optional(),
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

  const phoneErr = validatePhoneRequired(parsed.data.phone);
  if (phoneErr) return { error: phoneErr };

  await updateUserProfilePrefs(session.user.id, {
    phone: parsed.data.phone.trim(),
  });

  const payload = {
    species: parsed.data.species,
    injurySeverity: parsed.data.injurySeverity,
    environmentalDanger: parsed.data.environmentalDanger,
    vulnerability: parsed.data.vulnerability,
    description: parsed.data.description,
    contactPreference: parsed.data.contactPreference,
    locationNote: parsed.data.locationNote,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    photoUrl: parsed.data.photoUrl || undefined,
  };

  const newCase = await submitReport({
    reporterId: session.user.id,
    ...payload,
  });

  revalidateAfterReport(session.user.id, newCase.id, session.user.email);

  return { caseId: newCase.id, caseNumber: newCase.caseNumber };
}
