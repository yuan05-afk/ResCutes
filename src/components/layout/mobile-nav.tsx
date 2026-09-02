"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MapPin, ClipboardList, User, Camera } from "lucide-react";
import { prefetchRouteNow } from "@/components/layout/AppRoutePrefetcher";
import { useNavigationPending } from "@/components/layout/NavigationPending";
import { useMobileShellFrame } from "@/components/layout/mobile-device-frame";

const navItems = [
  { href: "/mobile", label: "Home", icon: Home },
  { href: "/mobile/nearby", label: "Nearby", icon: MapPin },
  { href: "/mobile/report", label: "Report", icon: Camera, primary: true },
  { href: "/mobile/cases", label: "Cases", icon: ClipboardList },
  { href: "/mobile/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { startPending } = useNavigationPending();
  const { isFramed } = useMobileShellFrame();

  return (
    <nav
      className={cn(
        "z-50 shrink-0 border-t border-sage/25 bg-white safe-bottom",
        isFramed
          ? "relative w-full"
          : "fixed bottom-0 left-0 right-0 mx-auto max-w-mobile",
      )}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-mobile items-end justify-around px-2 pb-2 pt-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/mobile" && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={() => startPending(item.href)}
                className="flex flex-col items-center -mt-4 min-w-[64px]"
                aria-label="Report an animal"
              >
                <div
                  className={cn(
                    "flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-elevated transition-transform active:scale-95",
                    "bg-evergreen text-white hover:bg-evergreen/90",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-1.5 text-[11px] font-semibold text-evergreen">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onTouchStart={() => prefetchRouteNow(router, item.href)}
              onMouseEnter={() => prefetchRouteNow(router, item.href)}
              onClick={() => startPending(item.href)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-2 min-w-[56px] min-h-[44px] justify-center",
                isActive ? "text-evergreen" : "text-graphite/45",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 2} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
