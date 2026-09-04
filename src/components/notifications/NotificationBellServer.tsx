import { getAppNotificationsCached } from "@/lib/notifications";
import { NotificationBellClient } from "@/components/notifications/NotificationBellClient";

export async function NotificationBellServer({ userId }: { userId: string }) {
  const notifications = await getAppNotificationsCached(userId);
  return <NotificationBellClient notifications={notifications} />;
}
