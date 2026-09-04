import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface MobileHeaderProps {
  userName: string;
  greeting?: string;
  notificationCount?: number;
  /** Where the bell should go (cases list with updates). */
  notificationsHref?: string;
}

export function MobileHeader({
  userName,
  greeting,
  notificationCount = 0,
  notificationsHref = "/mobile/cases#updates",
}: MobileHeaderProps) {
  const firstName = userName.split(" ")[0];
  const timeGreeting =
    greeting ??
    (() => {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    })();

  return (
    <header className="border-b border-sage/20 bg-white px-4 pb-4 pt-4">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href={notificationsHref}
          className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-bone"
          aria-label={`Updates${notificationCount ? `, ${notificationCount} new` : ""}`}
        >
          <Bell className="h-5 w-5 text-graphite/70" />
          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rescue px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Link>
      </div>
      <h1 className="mt-4 text-[22px] font-bold leading-tight text-graphite">
        {timeGreeting}, {firstName}
      </h1>
    </header>
  );
}
