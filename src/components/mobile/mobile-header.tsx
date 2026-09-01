import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface MobileHeaderProps {
  userName: string;
  greeting?: string;
  locationLabel?: string;
  notificationCount?: number;
}

export function MobileHeader({
  userName,
  greeting,
  locationLabel = "Manila, Philippines",
  notificationCount = 0,
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
    <header className="bg-white px-4 pt-4 pb-5 border-b border-sage/20">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href="/mobile/cases"
          className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-bone transition-colors"
          aria-label={`Notifications${notificationCount ? `, ${notificationCount} updates` : ""}`}
        >
          <Bell className="h-5 w-5 text-graphite/70" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rescue px-1 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          )}
        </Link>
      </div>
      <div className="mt-5">
        <h1 className="text-[22px] font-bold text-graphite leading-tight">
          {timeGreeting}, {firstName}
        </h1>
        <p className="mt-1 flex items-center gap-1 text-sm text-graphite/55">
          <span className="text-evergreen">📍</span>
          {locationLabel}
        </p>
      </div>
    </header>
  );
}
