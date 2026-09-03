"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import type { AppNotification } from "@/lib/notifications";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";
import { cn } from "@/lib/utils";

export function NotificationBellClient({
  notifications: initial,
}: {
  notifications: AppNotification[];
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const badge = useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative rounded-full border p-1.5 transition sm:p-2",
          "hover:border-evergreen/40 hover:bg-evergreen/10 hover:text-evergreen hover:shadow-sm",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evergreen/35",
          open
            ? "border-evergreen/40 bg-evergreen/10 text-evergreen shadow-sm"
            : "border-transparent text-graphite",
        )}
        aria-label={
          badge > 0 ? `Notifications, ${badge} unread` : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell
          className={cn(
            "h-[18px] w-[18px] transition",
            open && "rc-bell-nudge",
          )}
          strokeWidth={1.75}
        />
        {badge > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rescue px-1 text-[9px] font-bold text-white ring-2 ring-bone">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </button>
      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onItemsChange={setItems}
      />
    </div>
  );
}

export function NotificationBellFallback() {
  return (
    <div className="rounded-full p-2 text-graphite/40" aria-hidden>
      <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
    </div>
  );
}
