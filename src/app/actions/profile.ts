"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateUserProfilePrefs } from "@/lib/data/user-profile";
import type { UserProfilePrefs } from "@/lib/data/user-profile";
import {
  DEPARTMENT_OPTIONS,
  isAllowedCatalogOrOther,
  validatePhoneRequired,
} from "@/lib/forms/animal-field-options";

export async function updateProfileAction(
  data: Partial<Omit<UserProfilePrefs, "userId">>,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  if (data.phone !== undefined) {
    const phoneErr = validatePhoneRequired(data.phone);
    if (phoneErr) return { error: phoneErr };
  }

  if (data.department !== undefined) {
    if (
      !isAllowedCatalogOrOther(data.department, DEPARTMENT_OPTIONS, {
        allowEmpty: true,
        maxLen: 80,
      })
    ) {
      return { error: "Select a valid department or describe Other." };
    }
  }

  if (data.timezone !== undefined && data.timezone.trim().length > 64) {
    return { error: "Timezone value is too long." };
  }

  await updateUserProfilePrefs(session.user.id, data);
  revalidatePath("/profile");
  revalidatePath("/mobile/profile");
  return { success: true };
}
