"use server";

import { auth } from "@/lib/auth";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/data/db/repository";
import { revalidateNotifications } from "@/lib/cache-revalidate";

export async function markNotificationReadAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  await markNotificationRead(id, session.user.id);
  revalidateNotifications(session.user.id);
  return { success: true as const };
}

export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" as const };

  await markAllNotificationsRead(session.user.id);
  revalidateNotifications(session.user.id);
  return { success: true as const };
}
