"use client";

import { createContext, useContext } from "react";

const NotificationSlotContext = createContext<React.ReactNode>(null);

export function NotificationSlotProvider({
  slot,
  children,
}: {
  slot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <NotificationSlotContext.Provider value={slot ?? null}>
      {children}
    </NotificationSlotContext.Provider>
  );
}

export function useNotificationSlot() {
  return useContext(NotificationSlotContext);
}

/** Desktop page-header placement for the notification bell. */
export function PageHeaderNotifications({
  className,
}: {
  className?: string;
}) {
  const slot = useNotificationSlot();
  if (!slot) return null;
  return <div className={className ?? "hidden md:block"}>{slot}</div>;
}
