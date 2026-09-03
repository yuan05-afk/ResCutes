"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  Bell,
  CheckCheck,
  CheckCircle2,
  HeartHandshake,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import type { AppNotification, NotificationKind } from "@/lib/notifications";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { cn } from "@/lib/utils";

const kindIcon: Record<NotificationKind, typeof Bell> = {
  status_update: Activity,
  assignment: UserPlus,
  handoff: HeartHandshake,
  medical_update: Stethoscope,
  system: Bell,
  adoption: HeartHandshake,
};

const kindTone: Record<NotificationKind, string> = {
  status_update: "bg-evergreen/10 text-evergreen",
  assignment: "bg-rescue/10 text-rescue",
  handoff: "bg-sage/30 text-evergreen",
  medical_update: "bg-rescue/10 text-rescue",
  system: "bg-bone text-graphite/70",
  adoption: "bg-evergreen/10 text-evergreen",
};

function pathOnly(href: string) {
  return href.split("?")[0]?.split("#")[0] ?? href;
}

export function NotificationPanel({
  open,
  onClose,
  items,
  onItemsChange,
}: {
  open: boolean;
  onClose: () => void;
  items: AppNotification[];
  onItemsChange?: (items: AppNotification[]) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { startPending } = useNavigationPending();
  const [, startTransition] = useTransition();
  const [visible, setVisible] = useState(open);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      const id = window.requestAnimationFrame(() => setEntered(true));
      return () => window.cancelAnimationFrame(id);
    }
    setEntered(false);
    const t = window.setTimeout(() => setVisible(false), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const unreadCount = useMemo(
    () => items.filter((i) => !i.read).length,
    [items],
  );

  function setReadLocal(id: string | "all") {
    const next =
      id === "all"
        ? items.map((i) => (i.read ? i : { ...i, read: true }))
        : items.map((i) => (i.id === id ? { ...i, read: true } : i));
    onItemsChange?.(next);
  }

  function markAllRead() {
    if (unreadCount === 0) return;
    setReadLocal("all");
    startTransition(() => {
      void markAllNotificationsReadAction();
    });
  }

  function markOne(id: string) {
    setReadLocal(id);
    startTransition(() => {
      void markNotificationReadAction(id);
    });
  }

  function goTo(href: string, markId?: string) {
    if (markId) markOne(markId);
    onClose();
    const dest = pathOnly(href);
    if (dest !== pathOnly(pathname)) {
      startPending(href);
    }
    router.push(href);
    if (href.includes("#")) {
      const id = href.slice(href.indexOf("#") + 1);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  }

  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-graphite/25 transition-opacity duration-200 sm:bg-graphite/10",
          entered ? "opacity-100" : "opacity-0",
        )}
        aria-label="Close notifications"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-label="Notifications"
        className={cn(
          "fixed inset-x-3 top-[3.75rem] z-50 mx-auto flex max-h-[min(78vh,32rem)] w-auto flex-col overflow-hidden rounded-2xl border border-sage/30 bg-white shadow-elevated transition duration-200 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[24rem]",
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-1 scale-[0.98] opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-sage/20 px-4 py-3">
          <div>
            <p className="text-[17px] font-bold tracking-tight text-graphite">
              Notifications
            </p>
            <p className="text-[11px] text-graphite/55">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : items.length > 0
                  ? "You're up to date"
                  : "Nothing needs attention"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-evergreen transition hover:bg-evergreen/10"
                onClick={markAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-full p-1.5 text-graphite/50 transition hover:bg-bone hover:text-graphite"
              aria-label="Close"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10 text-evergreen">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="text-sm font-bold text-graphite">All caught up</p>
              <p className="mt-1 text-xs leading-relaxed text-graphite/55">
                Case updates, assignments, and medical notes will show up here.
              </p>
            </div>
          ) : (
            <ul>
              {items.map((item) => {
                const Icon = kindIcon[item.kind];
                const unread = !item.read;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => goTo(item.href, item.id)}
                      className={cn(
                        "group flex w-full gap-3 px-3 py-3 text-left transition",
                        unread
                          ? "bg-evergreen/[0.06] hover:bg-evergreen/10"
                          : "bg-white hover:bg-bone/60",
                      )}
                    >
                      <span className="relative shrink-0">
                        <span
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-full",
                            kindTone[item.kind],
                          )}
                        >
                          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-sage/25">
                          <Bell className="h-2.5 w-2.5 text-evergreen" />
                        </span>
                      </span>

                      <span className="min-w-0 flex-1 pt-0.5">
                        <span
                          className={cn(
                            "block text-[13px] leading-snug text-graphite",
                            unread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-graphite/55">
                          {item.description}
                        </span>
                        <span
                          className={cn(
                            "mt-1 block text-[11px] font-semibold",
                            unread ? "text-evergreen" : "text-graphite/45",
                          )}
                        >
                          {item.timeLabel ?? "Update"}
                        </span>
                      </span>

                      {unread ? (
                        <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-rescue" />
                      ) : (
                        <span className="mt-2 w-2.5 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-sage/20 px-3 py-2.5 text-center">
          <button
            type="button"
            onClick={() => goTo("/profile#notifications")}
            className="text-[12px] font-semibold text-evergreen transition hover:underline"
          >
            Notification settings
          </button>
        </div>
      </div>
    </>
  );
}
