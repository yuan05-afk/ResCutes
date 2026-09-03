"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { updateUserProfilePrefs } from "@/lib/data/user-profile";
import type { UserProfilePrefs } from "@/lib/data/user-profile";

export async function updateProfileAction(
  data: Partial<Omit<UserProfilePrefs, "userId">>,
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await updateUserProfilePrefs(session.user.id, data);
  revalidatePath("/profile");
  return { success: true };
}
