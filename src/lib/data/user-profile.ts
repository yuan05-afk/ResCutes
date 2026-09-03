import {
  fetchUserProfilePrefs,
  upsertUserProfilePrefs,
} from "@/lib/data/db/repository";
import type { UserProfilePrefs } from "@/lib/data/types";

export type { UserProfilePrefs };

export async function getUserProfilePrefs(
  userId: string,
): Promise<UserProfilePrefs> {
  return fetchUserProfilePrefs(userId);
}

export async function updateUserProfilePrefs(
  userId: string,
  patch: Partial<Omit<UserProfilePrefs, "userId">>,
): Promise<UserProfilePrefs> {
  return upsertUserProfilePrefs(userId, patch);
}
